<script setup lang="ts">
import { useConfirmCV, useCVDownloadLink, useParsedCV, useUploadCV } from '@/composables/useCV'
import { useJobRole } from '@/composables/useJobRole'
import { useProfile } from '@/composables/useProfile'
import { useKabupaten, useProvinsi } from '@/composables/useRegion'
import CandidateLayout from '@/layouts/CandidateLayout.vue'
import { fetchAiModeStatus } from '@/services/system-setting'
import { useAuthStore } from '@/stores/auth.store'
import { getProfilePictureThumbnail } from '@/utils/image'
import {
  ArrowLeft,
  CloudUpload,
  Download,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  Link,
  MapPin,
  User
} from '@vicons/tabler'
import type { UploadFileInfo } from 'naive-ui'
import {
  NAvatar,
  NButton,
  NDatePicker,
  NDynamicTags,
  NForm, NFormItem,
  NGi,
  NGrid,
  NIcon,
  NInput,
  NInputNumber,
  NModal,
  NSelect, NSpin,
  NTag,
  NUpload,
  useMessage
} from 'naive-ui'
import { computed, onMounted, ref, watch } from 'vue'

defineOptions({
  name: 'CandidatePage',
})

// const logout = useLogout() // Moved to layout
const showUpdateFlow = ref(false)
const forceShowUpload = ref(false)
const isEditing = ref(false)
const isAiEnabled = ref(true)
const cvTemplateUrl = ref("")

onMounted(async () => {
  try {
    const data = await fetchAiModeStatus()
    isAiEnabled.value = data.is_ai_mode_enabled
    cvTemplateUrl.value = data.cv_template_url || ""
  } catch (err) {
    console.error('Failed to fetch AI mode status', err)
  }
})

// Composables
const authStore = useAuthStore()
const { profile, uploadPicture, isUploadingPicture, isLoading: isLoadingProfile, updateProfile, updateProfileAsync, isUpdatingProfile } = useProfile()
const { sectors, allRoles, isLoading: isLoadingJobRoles } = useJobRole()
const message = useMessage()
const { data: cvLinkData, refetch: refetchCVLink } = useCVDownloadLink()
const uploadMutation = useUploadCV()
const upload = uploadMutation.mutate
const cvQuery = useParsedCV()
const confirmMutation = useConfirmCV()

const userInitials = computed(() => {
  const name = profile.value?.name || authStore.user?.name || formData.value?.name || ""
  if (!name) return "U"
  const parts = name.trim().split(/\s+/)
  const first = parts[0] || ''
  if (!first) return 'U'
  if (parts.length === 1) return first.substring(0, 2).toUpperCase()
  const last = parts[parts.length - 1] || ''
  return (first[0] + (last[0] || '')).toUpperCase()
})

const profilePictureUrl = computed(() => {
  return getProfilePictureThumbnail(profile.value?.profile_picture)
})

watch(profile, (newVal) => {
  console.log('Profile updated in index.vue:', newVal)
  console.log('Profile picture in index.vue:', newVal?.profile_picture)
}, { immediate: true })

const jobRoleOptions = computed(() => {
  const options = []
  const roleNamesInGroups = new Set<string>()

  // 1. Always include a group for currently selected roles to guarantee names are shown immediately
  if (profile.value?.job_roles?.length) {
    const selectedChildren = profile.value.job_roles.map((r: any) => {
      roleNamesInGroups.add(r.name.toLowerCase())
      return { label: r.name, value: r.id }
    })
    options.push({
      type: 'group',
      label: 'Selected Roles',
      key: 'selected-roles-group',
      children: selectedChildren
    })
  }

  // 2. Add AI Suggested Roles (if any from current parsed data) 
  // and they aren't already in selected roles
  if (formData.value.applied_roles?.length) {
    const aiChildren = formData.value.applied_roles
      .map((r: any) => {
        const name = typeof r === 'string' ? r : r.name
        if (!name) return null

        // If already in selected roles, don't show here
        if (roleNamesInGroups.has(name.toLowerCase())) return null

        // Try to find the canonical ID from database roles
        const matched = allRoles.value?.find((ar: any) => ar.name.toLowerCase() === name.toLowerCase())
        const val = matched ? matched.id : `NEW_ROLE:${typeof r === 'object' ? r.sector : 'Undefined'}:${name}`

        roleNamesInGroups.add(name.toLowerCase())
        return { label: name, value: val }
      })
      .filter(Boolean)

    if (aiChildren.length > 0) {
      options.push({
        type: 'group',
        label: 'AI Suggested Roles',
        key: 'ai-suggested-group',
        children: aiChildren
      })
    }
  }

  // 3. Add the industry-grouped categories once the API returns data
  if (sectors.value && allRoles.value) {
    const mainGroups = sectors.value
      .filter((sector: any) => sector.is_active)
      .sort((a: any, b: any) => a.name.localeCompare(b.name))
      .map((sector: any) => {
        const rolesForSector = allRoles.value
          .filter((role: any) => role.sector_id === sector.id)
          .sort((a: any, b: any) => a.name.localeCompare(b.name))
        const activeRoles = rolesForSector.filter((r: any) => r.is_active).map((role: any) => ({ label: role.name, value: role.id, disabled: false }))
        const inactiveRoles = rolesForSector.filter((r: any) => !r.is_active).map((role: any) => ({ label: role.name, value: role.id, disabled: true }))
        return {
          type: 'group',
          label: sector.name,
          key: sector.id,
          children: [...activeRoles, ...inactiveRoles]
        }
      })
      .filter((g: any) => g.children.length > 0)
    options.push(...mainGroups)
  }

  return options
})

const handleJobRolesUpdate = (value: string[]) => {
  if (value.length > 3) {
    message.error("You can only select a maximum of 3 job roles.")
    formData.value.job_role_ids = value.slice(0, 3)
  } else {
    formData.value.job_role_ids = value
  }
}


const fileList = ref<UploadFileInfo[]>([])
const pictureUploadRef = ref<any>(null)
const regularCVUploadRef = ref<any>(null)
const showCVPreviewModal = ref(false)

const cvPreviewUrl = computed(() => cvLinkData.value?.data?.url || '')
const cvPreviewName = computed(() => cvLinkData.value?.data?.name || 'Curriculum Vitae')

const triggerPictureUpload = () => {
  pictureUploadRef.value?.$el?.querySelector('input')?.click()
}

const triggerRegularCVUpload = () => {
  regularCVUploadRef.value?.$el?.querySelector('input')?.click()
}

const formData = ref<Record<string, any>>({
  name: "",
  birthdate: null,
  phone_number: "",
  portofolio_link: "",
  school_university: "",
  major: "",
  gpa: 0,
  years_experience: 0,
  summary: "",
  tech_stack: [],
  applied_roles: [],
  provinsi_id: null,
  kabupaten_kota_id: null,
  job_role_ids: [],
  bidang: "",
  availability_status: 'available',
  unavailable_until: null
})

const availabilityOptions = [
  { label: 'Available', value: 'available' },
  { label: 'Unavailable', value: 'unavailable' }
]

const provQuery = useProvinsi()
const kabQuery = useKabupaten(computed(() => formData.value.provinsi_id))

const provinsiOptions = computed(() => {
  return provQuery.data.value?.data?.list?.map((p: any) => ({
    label: p.name,
    value: p.id
  })) || []
})

const kabupatenOptions = computed(() => {
  return kabQuery.data.value?.data?.list?.map((k: any) => ({
    label: k.name,
    value: k.id
  })) || []
})

const isProfileComplete = computed(() => {
  return !!profile.value?.school_university && !!profile.value?.major
})

const isProfileLocked = computed(() => {
  // Lock if no CV and no education data
  return !cvLinkData.value?.data?.url && !isProfileComplete.value
})

const age = computed(() => {
  if (!profile.value?.birthdate) return null
  const birthDate = new Date(profile.value.birthdate)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
})

const formatDate = (date: string | Date | null | undefined) => {
  if (!date) return '-'
  try {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  } catch {
    return '-'
  }
}

const handleUploadChange = (data: { fileList: UploadFileInfo[] }) => {
  fileList.value = data.fileList
}

const handleProfilePictureUpload = (data: { file: UploadFileInfo }) => {
  if (data.file.file) {
    uploadPicture(data.file.file, {
      onSuccess: () => {
        message.success("Profile picture updated!")
      },
      onError: (err: any) => {
        message.error(err.message || "Failed to upload picture")
      }
    })
  }
}

const startUpdateFlow = () => {
  showUpdateFlow.value = true
  forceShowUpload.value = true
  isEditing.value = false
}

const startEditing = () => {
  isEditing.value = true
  showUpdateFlow.value = false

  // Populate form from profile
  if (profile.value) {
    let ts: string[] = []
    try {
      if (profile.value.tech_stack) ts = JSON.parse(profile.value.tech_stack)
    } catch (e) { }

    const unavailableUntilRaw = profile.value.unavailable_until
    const unavailableUntilDate = unavailableUntilRaw ? new Date(unavailableUntilRaw) : null
    const isUnavailable = unavailableUntilDate ? unavailableUntilDate > new Date() : false

    formData.value = {
      name: profile.value.name,
      birthdate: profile.value.birthdate ? new Date(profile.value.birthdate).getTime() : null,
      phone_number: profile.value.phone_number || "",
      portofolio_link: profile.value.portofolio_link || "",
      school_university: profile.value.school_university,
      major: profile.value.major,
      gpa: profile.value.gpa,
      years_experience: profile.value.years_experience,
      summary: profile.value.summary || "",
      tech_stack: ts,
      applied_roles: profile.value.job_roles?.map((r: any) => r.name) || [],
      job_role_ids: profile.value.job_roles?.map((r: any) => r.id) || [],
      kabupaten_kota_id: profile.value.kabupaten_kota_id,
      provinsi_id: profile.value.kabupaten_kota_id?.includes('.') ? profile.value.kabupaten_kota_id.split('.')[0] : null,
      bidang: profile.value.bidang || "",
      availability_status: isUnavailable ? 'unavailable' : 'available',
      unavailable_until: unavailableUntilDate ? unavailableUntilDate.getTime() : null
    }
  }
}

const isUploadingRegular = ref(false)
const isUploadingAi = ref(false)

const handleAiCVUpload = (data: { file: UploadFileInfo }) => {
  if (data.file.file) {
    isUploadingAi.value = true
    upload({ file: data.file.file, skipParsing: false }, {
      onSuccess: () => {
        message.success("Upload successful! Waiting for AI processing...")
        isEditing.value = false
        showUpdateFlow.value = true
        forceShowUpload.value = false
        cvQuery.refetch()
        refetchCVLink()
      },
      onError: (err: any) => {
        message.error(err.message || "AI CV Upload failed")
      },
      onSettled: () => {
        isUploadingAi.value = false
      }
    })
  }
}

const handleRegularCVUpload = (data: { file: UploadFileInfo }) => {
  if (data.file.file) {
    isUploadingRegular.value = true
    upload({ file: data.file.file, skipParsing: true }, {
      onSuccess: () => {
        message.success("CV file updated successfully!")
        cvQuery.refetch()
        refetchCVLink()
      },
      onError: (err: any) => {
        message.error(err.message || "CV file upload failed")
      },
      onSettled: () => {
        isUploadingRegular.value = false
      }
    })
  }
}

const submitUpload = () => {
  const currentFile = fileList.value[0]?.file
  if (fileList.value.length > 0 && currentFile) {
    upload({ file: currentFile, skipParsing: !isAiEnabled.value }, {
      onSuccess: () => {
        message.success(isAiEnabled.value
          ? "Upload successful! Waiting for AI processing..."
          : "Upload successful!")
        fileList.value = []
        forceShowUpload.value = false
        cvQuery.refetch()
        refetchCVLink()
        if (!isAiEnabled.value) {
          startEditing()
        }
      },
      onError: (err: any) => {
        message.error(err.message || "Upload failed")
      }
    })
  }
}

const onConfirm = async () => {
  try {
    // 1. Confirm CV parsed data
    await confirmMutation.mutateAsync(formData.value)

    // 2. Update profile with latest fields (birthdate, phone number, name, etc.)
    const body = {
      ...formData.value,
      birthdate: formData.value.birthdate ? new Date(formData.value.birthdate).toISOString().split('T')[0] : null
    }
    await updateProfileAsync(body)

    message.success("Profile updated successfully!")
    showUpdateFlow.value = false
  } catch (err: any) {
    message.error(err.message || "Failed to update profile")
  }
}

const onUpdateProfile = () => {
  // In this edit mode, we might want to manually set job_role_ids if they changed via applied_roles tags
  const body = {
    ...formData.value,
    birthdate: formData.value.birthdate ? new Date(formData.value.birthdate).toISOString().split('T')[0] : null
  }

  updateProfile(body, {
    onSuccess: () => {
      message.success("Profile updated successfully!")
      isEditing.value = false
    },
    onError: (err: any) => {
      message.error(err.message || "Failed to update profile")
    }
  })
}

const currentStep = computed(() => {
  const cv = cvQuery.data.value?.data

  if (isEditing.value) return 'EDIT'

  // If AI is disabled, bypass all parsing pages and go straight to EDIT if profile is incomplete
  if (!isAiEnabled.value) {
    if (!isProfileComplete.value) return 'EDIT'
    if (showUpdateFlow.value) return 'EDIT'
    return 'VIEW'
  }

  // If AI is enabled
  const isParsingOrWaiting = cv && (cv.status === 'UPLOADED' || cv.status === 'PARSING' || cv.status === 'FAILED') && cv.parsed_data === null

  // If user explicitly chooses to update
  if (showUpdateFlow.value) {
    if (forceShowUpload.value || !cv) return 'UPLOAD'
    if (isParsingOrWaiting) return 'PARSING'
    if (cv.parsed_data) return 'REVIEW'
    return 'VIEW'
  }

  // Onboarding / Initial flow
  if (!isProfileComplete.value) {
    if (!cv) return 'UPLOAD'
    if (isParsingOrWaiting) return 'PARSING'
    if (cv.parsed_data) return 'REVIEW'
  }

  return 'VIEW'
})

const parsingProgress = computed(() => {
  return cvQuery.data.value?.data?.progress || 20
})

const parsingStatusMessage = computed(() => {
  const progress = parsingProgress.value
  if (progress <= 35) {
    return "CV uploaded. Extracting text from document..."
  } else if (progress <= 65) {
    return "Text extracted. Initializing AI analyzer..."
  } else {
    return "AI is structuring candidate profile..."
  }
})

const downloadCV = () => {
  if (cvLinkData.value?.data?.url) {
    window.open(cvLinkData.value.data.url, '_blank')
  }
}

// Tech stack and roles as arrays for UI display
const techStackList = computed(() => {
  if (!profile.value?.tech_stack) return []
  try {
    return JSON.parse(profile.value.tech_stack) as string[]
  } catch {
    return []
  }
})

watch(() => cvQuery.data.value?.data?.parsed_data, (newData) => {
  if (newData) {
    let parsedDataObj = newData
    if (typeof newData === 'string') {
      try {
        parsedDataObj = JSON.parse(newData)
      } catch (e) { }
    }
    const parsed = { ...parsedDataObj }

    if (parsed.kabupaten_kota && typeof parsed.kabupaten_kota === 'string' && parsed.kabupaten_kota.includes('.')) {
      parsed.kabupaten_kota_id = parsed.kabupaten_kota
      parsed.provinsi_id = parsed.kabupaten_kota.split('.')[0]
    } else {
      parsed.kabupaten_kota_id = null
      parsed.provinsi_id = null
    }

    // Ensure arrays are initialized
    parsed.tech_stack = parsed.tech_stack || []
    parsed.applied_roles = parsed.applied_roles || []
    parsed.job_role_ids = parsed.job_role_ids || []
    parsed.gpa = Number(parsed.gpa) || 0
    parsed.years_experience = Number(parsed.years_experience) || 0

    // Don't take name from parsed CV data, use existing name instead
    parsed.name = profile.value?.name || authStore.user?.name || formData.value.name || ""

    // Map applied_roles (objects) to job_role_ids (IDs if match found, else Objects)
    if (parsed.applied_roles.length > 0) {
      const mappedIds = parsed.applied_roles.map((r: any) => {
        const name = typeof r === 'string' ? r : r.name
        const matched = allRoles.value?.find((ar: any) => ar.name.toLowerCase() === name.toLowerCase())
        if (matched) return matched.id

        // Return a composite string to preserve sector info and ensure stable value for NSelect
        const sector = typeof r === 'object' ? r.sector : 'Undefined'
        return `NEW_ROLE:${sector}:${name}`
      })
      // Enforce limit of 3
      parsed.job_role_ids = mappedIds.slice(0, 3)
    }

    formData.value = { ...formData.value, ...parsed }
  }
}, { immediate: true, deep: true })
</script>

<template>
  <CandidateLayout :container-class="['UPLOAD', 'PARSING'].includes(currentStep)
    ? 'bg-[#050A1F] rounded-3xl shadow-2xl border border-[#1e295d]/30 overflow-hidden flex-1 flex flex-col text-white p-6 md:p-8'
    : 'bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col'">
    <div class="p-6">


      <!-- Loading State -->
      <n-spin :show="isLoadingProfile || isUploadingPicture">

        <!-- PROFILE VIEW (Default if complete and not updating) -->
        <div v-if="currentStep === 'VIEW'">
          <div class="relative">
            <!-- Profile Detail Content -->
            <div class="relative mt-0">
              <!-- Blurred State Overlay -->
              <div v-if="isProfileLocked"
                class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-md rounded-3xl p-12 text-center">
                <div
                  class="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
                  <n-icon :component="CloudUpload" size="40" />
                </div>
                <h2 class="text-3xl font-bold text-gray-800">Complete Your Profile</h2>
                <p class="text-gray-500 mt-2 max-w-sm mb-8">
                  Wait until AI finish parsing your CV.
                </p>
              </div>

              <div :class="{ 'blur-sm select-none pointer-events-none grayscale-40': isProfileLocked }">
                <div class="flex justify-between items-center mb-6 border-b border-gray-100">
                  <h2 class="text-2xl font-bold text-primary">Your Profile</h2>
                  <n-button type="primary" color="#0014B2" @click="startEditing" class="font-bold">
                    <span>Edit Profile</span>
                    <n-icon class="ml-2" :component="Edit" />
                  </n-button>
                </div>

                <div class="space-y-12">
                  <!-- Personal Information -->
                  <section>
                    <div class="relative group w-fit">
                      <img
                        v-if="profilePictureUrl"
                        :src="profilePictureUrl"
                        class="w-[100px] h-[100px] rounded-full object-cover shadow-lg border-2 border-white transition-all group-hover:scale-105"
                      />
                      <n-avatar v-else round :size="100"
                        class="shadow-lg border-2 border-white bg-blue-600 text-white font-bold text-3xl transition-all group-hover:scale-105 flex items-center justify-center">
                        {{ userInitials }}
                      </n-avatar>
                      <div
                        class="absolute bottom-1 right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        @click="triggerPictureUpload">
                        <n-icon :component="Edit" size="16" class="text-gray-800" />
                      </div>
                      <n-upload ref="pictureUploadRef" :show-file-list="false" @change="handleProfilePictureUpload"
                        class="hidden" />
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                      <div class="col-span-1 md:col-span-2 mt-4">
                        <h3 class="text-lg font-bold text-gray-400">Personal Information</h3>
                      </div>

                      <div class="space-y-1">
                        <p class="text-sm font-bold text-primary">Date of Birth</p>
                        <p class="text-[17px] font-bold text-gray-800">{{ formatDate(profile?.birthdate) }} <span
                            v-if="age" class="text-gray-400 font-medium ml-2">({{ age }} Years Old)</span></p>
                      </div>

                      <div class="space-y-1">
                        <p class="text-sm font-bold text-primary">Email</p>
                        <p class="text-[17px] font-bold text-gray-800">{{ profile?.email }}</p>
                      </div>

                      <div class="space-y-1">
                        <p class="text-sm font-bold text-primary">Phone Number</p>
                        <p class="text-[17px] font-bold text-gray-800">{{ profile?.phone_number || '-' }}</p>
                      </div>
                    </div>
                  </section>

                  <!-- Education -->
                  <section>
                    <h3 class="text-lg font-bold text-gray-400 mb-6">Education</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                      <div class="space-y-1">
                        <p class="text-sm font-bold text-primary">Universitas / Sekolah</p>
                        <p class="text-[17px] font-bold text-gray-800">{{ profile?.school_university || '-' }}</p>
                      </div>
                      <div class="space-y-1">
                        <p class="text-sm font-bold text-primary">Jurusan / Prodi</p>
                        <p class="text-[17px] font-bold text-gray-800">{{ profile?.major || '-' }}</p>
                      </div>
                      <div class="space-y-1">
                        <p class="text-sm font-bold text-primary">GPA</p>
                        <p class="text-[17px] font-bold text-gray-800">{{ profile?.gpa?.toFixed(2) || '0.00' }}</p>
                      </div>
                    </div>
                  </section>

                  <!-- Location -->
                  <section>
                    <h3 class="text-lg font-bold text-gray-400 mb-6">Location</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                      <div class="space-y-1">
                        <p class="text-sm font-bold text-primary">Kabupaten / Kota</p>
                        <p class="text-[17px] font-bold text-gray-800">
                          {{ kabupatenOptions.find((k: any) => k.value === profile?.kabupaten_kota_id)?.label || 'Not Specified' }}
                        </p>
                      </div>
                      <div class="space-y-1">
                        <p class="text-sm font-bold text-primary">Provinsi</p>
                        <p class="text-[17px] font-bold text-gray-800">
                          {{provinsiOptions.find((p: any) => p.value ===
                            (profile?.kabupaten_kota_id?.split('.')[0]))?.label || '-' }}
                        </p>
                      </div>
                    </div>
                  </section>

                  <!-- Professional Information -->
                  <section>
                    <h3 class="text-lg font-bold text-gray-400 mb-6">Professional Information</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                      <div class="space-y-1">
                        <p class="text-sm font-bold text-primary">Bidang Minat</p>
                        <p class="text-[17px] font-bold text-gray-800">{{ profile?.bidang || '-' }}</p>
                      </div>
                      <div class="space-y-1">
                        <p class="text-sm font-bold text-primary">Applied Role</p>
                        <p class="text-[17px] font-bold text-gray-800">
                          {{profile?.job_roles?.map((r: any) => r.name).join(', ') || '-'}}
                        </p>
                      </div>
                      <div class="space-y-1">
                        <p class="text-sm font-bold text-primary">Pengalaman Kerja</p>
                        <p class="text-[17px] font-bold text-gray-800">{{ profile?.years_experience || 0 }} Tahun</p>
                      </div>
                      <div class="col-span-1 md:col-span-2 space-y-3 pt-2">
                        <p class="text-sm font-bold text-primary">Skills</p>
                        <div class="flex flex-wrap gap-2">
                          <n-tag v-for="skill in techStackList" :key="skill" round
                            :color="{ borderColor: '#07229E', textColor: '#07229E' }">
                            {{ skill }}
                          </n-tag>
                        </div>
                      </div>
                      <div class="space-y-1">
                        <p class="text-sm font-bold text-primary">Link Portofolio</p>
                        <div v-if="profile?.portofolio_link" class="flex items-center gap-2">
                          <n-icon :component="ExternalLink" class="text-blue-500" />
                          <a :href="profile.portofolio_link" target="_blank"
                            class="text-lg underline font-bold text-blue-700">
                            {{ profile.portofolio_link.replace(/^https?:\/\//, '') }}
                          </a>
                        </div>
                        <p v-else class="text-[17px] font-bold text-gray-800">-</p>
                      </div>
                    </div>
                  </section>

                  <!-- Availability -->
                  <section>
                    <h3 class="text-lg font-bold text-gray-400 mb-4">Availability</h3>
                    <div class="flex items-center gap-4">
                      <n-tag v-if="!profile?.unavailable_until || new Date(profile.unavailable_until) <= new Date()"
                        type="success" round strong size="large">
                        ✓ Available
                      </n-tag>
                      <template v-else>
                        <n-tag type="warning" round strong size="large">
                          ✗ Unavailable
                        </n-tag>
                        <div class="space-y-0.5">
                          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Unavailable Until</p>
                          <p class="text-[15px] font-bold text-gray-800">{{ formatDate(profile.unavailable_until) }}</p>
                        </div>
                      </template>
                    </div>
                  </section>

                  <!-- CV -->
                  <section v-if="cvLinkData?.data?.url">
                    <p class="text-sm font-bold text-primary mb-2">Curriculum Vitae</p>
                    <div
                      class="p-5 border border-gray-200 rounded-2xl flex items-center justify-between hover:border-blue-300 transition-colors group cursor-pointer"
                      @click="showCVPreviewModal = true">
                      <div class="flex items-center gap-4">
                        <div
                          class="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center border border-red-100 group-hover:bg-red-500 group-hover:text-white transition-all">
                          <n-icon :component="FileText" size="28" />
                        </div>
                        <div>
                          <p class="font-bold text-gray-800 text-[16px]">{{ cvLinkData.data.name ||
                            'Professional_CV.pdf' }}</p>
                          <p class="text-[12px] text-gray-400 font-medium">PDF Document &bull; Verified</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-4 text-gray-400">
                        <n-icon :component="Eye" size="18" class="hover:text-blue-500 cursor-pointer" @click.stop="showCVPreviewModal = true" />
                        <n-icon :component="Download" size="18" class="hover:text-blue-500 cursor-pointer" @click.stop="downloadCV" />
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 1. Upload Phase -->
        <div v-if="currentStep === 'UPLOAD'">
          <!-- Back button (only if profile is complete so they can go back to VIEW) -->
          <div class="mb-6">
            <n-button v-if="isProfileComplete" circle @click="showUpdateFlow = false"
              class="shadow-sm border-gray-700 bg-gray-800 text-white hover:bg-gray-700 hover:text-white">
              <template #icon><n-icon :component="ArrowLeft" /></template>
            </n-button>
          </div>

          <!-- Content directly styled inside the parent dark container -->
          <div class="flex items-start gap-4">
            <!-- Sparkles Icon -->
            <div class="flex-shrink-0 mt-0.5">
              <svg class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 3C12 3 12 7.5 14.5 10C17 12.5 21.5 12.5 21.5 12.5C21.5 12.5 17 12.5 14.5 15C12 17.5 12 22 12 22C12 22 12 17.5 9.5 15C7 12.5 2.5 12.5 2.5 12.5C2.5 12.5 7 12.5 9.5 10C12 7.5 12 3 12 3Z"
                  fill="currentColor" />
                <path
                  d="M19 3C19 3 19 4.5 19.8333 5.33333C20.6667 6.16667 22.1667 6.16667 22.1667 6.16667C22.1667 6.16667 20.6667 6.16667 19.8333 7C19 7.83333 19 9.33333 19 9.33333C19 9.33333 19 7.83333 18.1667 7C17.3333 6.16667 15.8333 6.16667 15.8333 6.16667C15.8333 6.16667 17.3333 6.16667 18.1667 5.33333C19 4.5 19 3 19 3Z"
                  fill="currentColor" opacity="0.7" />
              </svg>
            </div>
            <!-- Title & Subtitle -->
            <div class="flex-1">
              <h2 class="text-xl font-bold tracking-tight text-white">AI Parsing - Auto Fill Form</h2>
              <p class="text-gray-400 text-sm mt-1 leading-relaxed">
                Upload your CV and let AI automatically fill in all your information. Save time and get accurate data
                extraction
                instantly!
              </p>
              <p v-if="cvTemplateUrl" class="text-gray-300 text-sm mt-2">
                Download <a :href="cvTemplateUrl" target="_blank" class="underline font-bold text-white hover:text-blue-300 transition-colors">CV Template.docx</a> Here
              </p>
            </div>
          </div>

          <!-- Upload Component -->
          <div class="mt-6 w-full flex items-center justify-center">
            <n-upload class="w-full [&_.n-upload-trigger]:w-full [&_.n-upload-trigger]:block" :default-upload="false"
              v-model:file-list="fileList" @change="handleUploadChange" accept=".pdf" :max="1" :show-file-list="false"
              directory-dnd>
              <div
                class="w-full border-dashed border border-[#2b3558] bg-[#0c1231]/40 hover:bg-[#0f173d]/60 hover:border-blue-500 transition-all rounded-xl p-8 cursor-pointer text-center">
                <!-- When no file is uploaded -->
                <div v-if="fileList.length === 0" class="flex flex-col items-center w-full">
                  <svg class="w-7 h-7 text-gray-300 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H9L7 3H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
                  </svg>
                  <p class="text-gray-200 font-medium text-sm">Drop your files or click to upload</p>
                  <p class="text-gray-500 text-xs mt-1 mb-4">Supported file types: PDF</p>
                  <span
                    class="inline-block bg-white text-[#0c1231] font-semibold text-xs px-5 py-2 rounded shadow hover:bg-gray-150 transition-colors">
                    Browse
                  </span>
                </div>

                <!-- When file is uploaded -->
                <div v-else class="flex flex-col items-center justify-center py-2">
                  <svg class="w-8 h-8 text-red-400 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                    <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
                  </svg>
                  <p class="text-white font-semibold text-sm max-w-md truncate">{{ fileList[0]?.name }}</p>
                  <p class="text-gray-400 text-xs mt-1" v-if="fileList[0]?.file?.size">
                    {{ ((fileList[0]?.file?.size || 0) / 1024 / 1024).toFixed(2) }} MB
                  </p>
                  <button type="button"
                    class="mt-4 text-xs text-red-400 hover:text-red-300 font-semibold underline cursor-pointer focus:outline-none"
                    @click.stop="fileList = []">
                    Remove File
                  </button>
                </div>
              </div>
            </n-upload>
          </div>

          <!-- Action Button -->
          <div class="flex justify-center mt-6">
            <button type="button" :disabled="fileList.length === 0 || uploadMutation.isPending.value" :class="[
              'px-7 py-2.5 rounded-full font-semibold text-sm shadow-xl transition-all flex items-center justify-center gap-2 border',
              fileList.length === 0
                ? 'bg-transparent text-gray-500 border-gray-700 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-[#0d2a84] to-[#12286c] hover:from-[#1135a5] hover:to-[#173397] border-[#263e8a] text-white cursor-pointer active:scale-95'
            ]" @click="submitUpload">
              <n-spin v-if="uploadMutation.isPending.value" size="small" class="mr-1" stroke="currentColor" />
              <span>{{ uploadMutation.isPending.value ? 'Extracting...' : 'Extract CV Data with AI' }}</span>
              <svg v-if="!uploadMutation.isPending.value" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 3C12 3 12 7.5 14.5 10C17 12.5 21.5 12.5 21.5 12.5C21.5 12.5 17 12.5 14.5 15C12 17.5 12 22 12 22C12 22 12 17.5 9.5 15C7 12.5 2.5 12.5 2.5 12.5C2.5 12.5 7 12.5 9.5 10C12 7.5 12 3 12 3Z"
                  fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>

        <!-- 2. Parsing Phase -->
        <div v-if="currentStep === 'PARSING'" class="text-white">
          <div class="p-16 text-center max-w-xl mx-auto">
            <div v-if="cvQuery.data.value?.data?.status === 'FAILED'" class="flex flex-col items-center">
              <div class="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mb-6">
                <n-icon :component="FileText" size="40" class="text-red-500" />
              </div>
              <h2 class="text-3xl font-extrabold text-white mb-2">AI Parsing Failed</h2>
              <p class="text-gray-400 mt-2 mb-8">
                We were unable to parse your CV automatically. This could be due to a temporary service interruption or document format issues. You can fill in your details manually to complete your profile.
              </p>
              <div class="flex justify-center gap-4">
                <n-button type="primary" color="#0014B2" @click="startEditing" class="font-bold">
                  Fill Profile Manually
                </n-button>
                <n-button ghost @click="showUpdateFlow = false">
                  Cancel
                </n-button>
              </div>
            </div>

            <div v-else class="flex flex-col items-center">
              <h2 class="text-3xl font-extrabold text-white mb-2">AI Analyzer is at work</h2>

              <!-- Progress Bar Container -->
              <div class="w-full bg-gray-800 rounded-full h-3.5 overflow-hidden relative shadow-inner mt-6 mb-3">
                <div class="bg-blue-500 h-full rounded-full transition-all duration-500 ease-out"
                  :style="{ width: parsingProgress + '%' }"></div>
              </div>

              <!-- Progress Details -->
              <div class="flex justify-between items-center w-full px-1 text-sm font-bold text-gray-400 mb-4">
                <span class="text-blue-400">{{ parsingStatusMessage }}</span>
                <span class="text-blue-400 font-extrabold">{{ parsingProgress }}%</span>
              </div>

              <div class="mt-8 flex gap-2">
                <div class="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"></div>
                <div class="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div class="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Review/Confirm Phase (Unified with Direct Edit) -->
        <div v-if="['REVIEW', 'EDIT'].includes(currentStep)">
          <div class="mb-6 mt-6 flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold tracking-tight text-gray-800">
                {{ currentStep === 'EDIT' ? 'Edit Your Profile' : 'Review Your Profile' }}
              </h1>
              <p class="text-gray-400 mt-1 text-sm">
                {{ currentStep === 'EDIT' ? 'Make changes to your professional information.' : 'Please verify the information extracted by our AI assistant.' }}
              </p>
            </div>
            <n-tag v-if="currentStep === 'REVIEW'" type="success" size="large" round strong shadow>
              <template #icon><n-icon :component="MapPin" /></template>
              AI Parsing Successful
            </n-tag>
            <n-button v-else circle @click="isEditing = false" class="shadow-sm">
              <template #icon><n-icon :component="ArrowLeft" /></template>
            </n-button>
          </div>

          <!-- CV Parsed Successfully Banner -->
          <div v-if="isAiEnabled && (currentStep === 'REVIEW' || cvLinkData?.data?.url)"
            class="flex flex-col md:flex-row gap-4 items-center justify-between p-6 rounded-xl shadow-lg relative overflow-hidden mb-8 border border-blue-900/30"
            style="background: linear-gradient(-84.0771deg, rgb(11, 17, 33) 47.518%, rgb(2, 6, 23) 53.988%)">
            
            <!-- Ellipse overlays for premium glassmorphism/glow effect -->
            <div class="absolute left-[-50px] top-[-50px] w-64 h-64 rounded-full bg-blue-500/10 blur-[60px] pointer-events-none"></div>
            <div class="absolute right-[-50px] bottom-[-50px] w-64 h-64 rounded-full bg-indigo-500/10 blur-[60px] pointer-events-none"></div>

            <div class="flex items-center gap-4 z-10">
              <!-- Left spark/check icon -->
              <div class="w-12 h-12 bg-blue-500/15 border border-blue-500/30 text-blue-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
                <svg class="w-6 h-6 animate-pulse" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                </svg>
              </div>
              <div class="text-left">
                <h4 class="text-lg font-bold text-white leading-snug">CV Parsed Successfully!</h4>
                <p class="text-sm text-gray-300 mt-1 leading-relaxed max-w-xl">
                  We’ve pre-filled the form for you. Please double-check the information to ensure everything is accurate.
                </p>
              </div>
            </div>

            <div class="z-10 flex-shrink-0">
              <n-spin :show="isUploadingAi">
                <n-upload
                  :default-upload="false"
                  @change="handleAiCVUpload"
                  accept=".pdf"
                  :max="1"
                  :show-file-list="false"
                >
                  <button
                    type="button"
                    class="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-white font-semibold text-sm px-6 py-2.5 rounded-full flex items-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95 focus:outline-none"
                  >
                    <n-icon :component="CloudUpload" size="18" />
                    <span>Reupload and Parse CV</span>
                  </button>
                </n-upload>
              </n-spin>
            </div>
          </div>

          <n-form :model="formData" label-placement="top" size="large">
            <div class="space-y-8">

              <!-- Profile Photo -->
              <section>
                <h3 class="text-xl font-bold text-primary mb-4">Profile Photo</h3>
                <div class="border border-gray-200 rounded-xl p-5 flex items-center gap-6">
                  <img
                    v-if="profilePictureUrl"
                    :src="profilePictureUrl"
                    class="w-[72px] h-[72px] rounded-full object-cover shadow border-2 border-white flex-shrink-0"
                  />
                  <n-avatar v-else round :size="72"
                    class="shadow border-2 border-white bg-blue-600 text-white font-bold text-2xl flex-shrink-0 flex items-center justify-center">
                    {{ userInitials }}
                  </n-avatar>
                  <div class="flex flex-col gap-1">
                    <n-upload ref="pictureUploadRef" :show-file-list="false" @change="handleProfilePictureUpload"
                      accept=".jpg,.jpeg,.png">
                      <n-button type="primary" color="#0014B2" :loading="isUploadingPicture" size="medium">
                        <template #icon><n-icon :component="CloudUpload" /></template>
                        Upload Photo
                      </n-button>
                    </n-upload>
                    <p class="text-xs text-gray-400 mt-1">JPG or PNG. Max 2MB</p>
                  </div>
                </div>
              </section>

              <!-- Personal Information -->
              <section>
                <h3 class="text-xl font-bold text-primary mb-4">Personal Information</h3>
                <div class="border border-gray-200 rounded-xl p-5 space-y-4">
                  <n-form-item label="Full Name">
                    <n-input v-model:value="formData.name" placeholder="Enter your full name" />
                  </n-form-item>
                  <n-form-item label="Date of Birth">
                    <n-date-picker v-model:value="formData.birthdate" type="date" class="w-full" clearable
                      placeholder="Select your date of birth" />
                  </n-form-item>
                  <n-grid :cols="2" :x-gap="16">
                    <n-gi>
                      <n-form-item label="Email Address">
                        <n-input :value="profile?.email || authStore.user?.email || ''" disabled
                          placeholder="Auto from regist">
                          <template #prefix><n-icon :component="ExternalLink" class="text-gray-400" /></template>
                        </n-input>
                      </n-form-item>
                    </n-gi>
                    <n-gi>
                      <n-form-item label="Phone Number">
                        <n-input v-model:value="formData.phone_number" placeholder="Enter your phone number">
                          <template #prefix><n-icon :component="User" class="text-gray-400" /></template>
                        </n-input>
                      </n-form-item>
                    </n-gi>
                  </n-grid>
                </div>
              </section>

              <!-- Education -->
              <section>
                <h3 class="text-xl font-bold text-primary mb-4">Education</h3>
                <div class="border border-gray-200 rounded-xl p-5 space-y-4">
                  <n-form-item label="University / School">
                    <n-input v-model:value="formData.school_university" placeholder="Enter your university or school name" />
                  </n-form-item>
                  <n-grid :cols="2" :x-gap="16">
                    <n-gi>
                      <n-form-item label="Major / Field of Study">
                        <n-input v-model:value="formData.major" placeholder="Enter your major or field of study" />
                      </n-form-item>
                    </n-gi>
                    <n-gi>
                      <n-form-item label="GPA">
                        <n-input-number v-model:value="formData.gpa" :step="0.01" :min="0" :max="4" class="w-full"
                          placeholder="Enter your GPA (e.g. 3.54)" />
                      </n-form-item>
                    </n-gi>
                  </n-grid>
                </div>
              </section>

              <!-- Address -->
              <section>
                <h3 class="text-xl font-bold text-primary mb-4">Address</h3>
                <div class="border border-gray-200 rounded-xl p-5">
                  <n-grid :cols="2" :x-gap="16">
                    <n-gi>
                      <n-form-item label="Province">
                        <n-select v-model:value="formData.provinsi_id" :options="provinsiOptions"
                          :loading="provQuery.isPending.value" placeholder="Select your province" filterable clearable
                          @update:value="formData.kabupaten_kota_id = null" />
                      </n-form-item>
                    </n-gi>
                    <n-gi>
                      <n-form-item label="City / Regency">
                        <n-select v-model:value="formData.kabupaten_kota_id" :options="kabupatenOptions"
                          :loading="kabQuery.isPending.value" :disabled="!formData.provinsi_id"
                          placeholder="Select your city or regency" filterable clearable />
                      </n-form-item>
                    </n-gi>
                  </n-grid>
                </div>
              </section>

              <!-- Professional Information -->
              <section>
                <h3 class="text-xl font-bold text-primary mb-4">Professional Information</h3>
                <div class="border border-gray-200 rounded-xl p-5 space-y-4">

                  <!-- Availability row -->
                  <n-grid :cols="2" :x-gap="16">
                    <n-gi>
                      <n-form-item label="Availability">
                        <n-select v-model:value="formData.availability_status" :options="availabilityOptions"
                          placeholder="Select your state of interest" />
                      </n-form-item>
                    </n-gi>
                    <n-gi>
                      <n-form-item label="Unavailable Until">
                        <n-date-picker v-model:value="formData.unavailable_until" type="date" class="w-full" clearable
                          placeholder="Select the date you will be available"
                          :disabled="formData.availability_status === 'available'"
                          :is-date-disabled="(ts: number) => ts < Date.now()" />
                      </n-form-item>
                    </n-gi>
                  </n-grid>

                  <!-- Summary -->
                  <n-form-item label="Summary">
                    <n-input v-model:value="formData.summary" type="textarea" :rows="4"
                      placeholder="Enter your summary" />
                  </n-form-item>

                  <!-- Applied Role -->
                  <n-form-item label="Applied Role">
                    <n-select :key="allRoles?.length || 0" v-model:value="formData.job_role_ids" multiple
                      :max-tag-count="3" :options="jobRoleOptions"
                      placeholder="Select the role you are applying for"
                      :loading="isLoadingJobRoles" @update:value="handleJobRolesUpdate" />
                  </n-form-item>

                  <!-- Work Experience -->
                  <n-form-item label="Work Experience">
                    <n-input-number v-model:value="formData.years_experience" :min="0" class="w-full"
                      placeholder="Years of experience (e.g. 3 years)" />
                  </n-form-item>

                  <!-- Portfolio Link -->
                  <n-form-item label="Portfolio Link">
                    <n-input v-model:value="formData.portofolio_link" placeholder="Enter your portfolio URL">
                      <template #prefix><n-icon :component="Link" class="text-gray-400" /></template>
                    </n-input>
                  </n-form-item>

                  <!-- Skills -->
                  <n-form-item label="Skills">
                    <n-dynamic-tags v-model:value="formData.tech_stack" />
                  </n-form-item>

                  <!-- CV Upload (File Only) -->
                  <n-form-item :label="isAiEnabled ? 'Curriculum Vitae (CV)' : 'Curriculum Vitae (CV)'">
                    <n-spin :show="isUploadingRegular" class="w-full">
                      <!-- If CV exists, show Figma-style view/edit bar -->
                      <div v-if="cvLinkData?.data?.url" class="w-full flex flex-col gap-2">
                        <div
                          class="w-full border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between hover:border-blue-400 hover:shadow-sm transition-all bg-white cursor-pointer"
                          @click="showCVPreviewModal = true"
                        >
                          <div class="flex items-center gap-3">
                            <div class="relative w-8 h-10 bg-white rounded border border-gray-200 shadow-sm flex flex-col items-center justify-between pb-0.5 pt-1 overflow-hidden flex-shrink-0">
                              <n-icon :component="FileText" size="16" class="text-red-500 -mt-0.5" />
                              <div class="w-full bg-red-500 text-white text-[7px] font-bold text-center py-0.5 scale-90">
                                PDF
                              </div>
                            </div>
                            <span class="font-bold text-slate-800 text-[15px] hover:text-blue-600 transition-colors truncate max-w-[200px] sm:max-w-[300px] md:max-w-[450px]">
                              {{ cvLinkData.data.name || 'Professional_CV.pdf' }}
                            </span>
                          </div>

                          <!-- Edit button triggers file picker -->
                          <div @click.stop="triggerRegularCVUpload" class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors">
                            <n-icon :component="Edit" size="16" class="text-gray-600" />
                            <span class="text-xs font-semibold text-gray-700">Edit</span>
                          </div>
                        </div>

                        <!-- Hidden upload trigger -->
                        <n-upload
                          ref="regularCVUploadRef"
                          class="hidden"
                          :default-upload="false"
                          @change="handleRegularCVUpload"
                          accept=".pdf,.jpg,.gif"
                          :max="1"
                          :show-file-list="false"
                        />
                      </div>

                      <!-- If no CV exists, show drag & drop area -->
                      <n-upload
                        v-else
                        class="w-full [&_.n-upload-trigger]:w-full [&_.n-upload-trigger]:block"
                        :default-upload="false"
                        @change="handleRegularCVUpload"
                        accept=".pdf,.jpg,.gif"
                        :max="1"
                        :show-file-list="false"
                        directory-dnd
                      >
                        <div
                          class="w-full border-dashed border-2 border-gray-200 hover:border-primary hover:bg-gray-50/50 transition-all rounded-xl p-8 cursor-pointer text-center"
                        >
                          <div class="flex flex-col items-center">
                            <n-icon :component="FileText" size="32" class="text-gray-300 mb-3" />
                            <p class="text-gray-500 font-medium text-sm">Drop your file or click to upload</p>
                            <p class="text-gray-400 text-xs mt-1 mb-4">Supported file types: PDF, JPG, GIF</p>
                            <span
                              class="inline-block border border-gray-300 text-gray-600 font-semibold text-xs px-6 py-2 rounded hover:bg-gray-50 transition-colors"
                            >
                              Browse
                            </span>
                          </div>
                        </div>
                      </n-upload>
                    </n-spin>
                  </n-form-item>
                </div>
              </section>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-between items-center mt-10 pt-6 border-t border-gray-100">
              <n-button ghost size="large"
                @click="currentStep === 'REVIEW' ? startUpdateFlow() : (isEditing = false)">
                {{ currentStep === 'REVIEW' ? 'Re-upload CV' : 'Cancel' }}
              </n-button>
              <n-button type="primary" color="#0014B2" size="large"
                :loading="confirmMutation.isPending.value || isUpdatingProfile"
                @click="currentStep === 'REVIEW' ? onConfirm() : onUpdateProfile()"
                class="px-12 font-bold rounded-xl shadow-md">
                {{ currentStep === 'REVIEW' ? 'Save & Update Profile' : 'Save Changes' }}
              </n-button>
            </div>
          </n-form>
        </div>
      </n-spin>
    </div>

    <!-- PDF CV Preview Modal -->
    <n-modal
      v-model:show="showCVPreviewModal"
      preset="card"
      :bordered="false"
      style="width: 52rem"
    >
      <div class="-mt-8">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-800">Preview CV</h3>
            <p class="text-sm text-gray-500">
              {{ cvPreviewName }}
            </p>
          </div>
        </div>

        <div class="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <iframe
            v-if="cvPreviewUrl"
            :src="cvPreviewUrl"
            title="CV Preview"
            class="h-[70vh] w-full"
          ></iframe>
          <div v-else class="flex items-center justify-center py-16 text-sm text-slate-400">
            Preview tidak tersedia.
          </div>
        </div>
      </div>
    </n-modal>
  </CandidateLayout>
</template>

