<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import UserLayout from '@/layouts/UserLayout.vue'
import { useUploadCV, useParsedCV, useConfirmCV, useCVDownloadLink } from '@/composables/useCV'
import { useProvinsi, useKabupaten } from '@/composables/useRegion'
import { useLogout } from '@/composables/useAuth'
import { useProfile } from '@/composables/useProfile'
import { useJobRole } from '@/composables/useJobRole'
import { 
  NUpload, NButton, NCard, NForm, NFormItem, NInput, 
  NInputNumber, NDynamicTags, NSelect, NSpin, NAlert,
  NAvatar, NGrid, NGi, NTag, NIcon, NDatePicker
} from 'naive-ui'
import { 
  CloudUpload, 
  Download, 
  Edit, 
  User,
  Briefcase,
  MapPin,
  ArrowLeft,
  Bell,
  Message,
  Settings,
  ExternalLink,
  FileText,
  Eye} from '@vicons/tabler'
import { fetchAiModeStatus } from '@/services/system-setting'
import type { UploadFileInfo } from 'naive-ui'

defineOptions({
  name: 'CandidatePage',
})

const logout = useLogout()
const successFeedback = ref("")
const errorFeedback = ref("")
const showUpdateFlow = ref(false)
const forceShowUpload = ref(false)
const isEditing = ref(false)
const isAiEnabled = ref(true)

onMounted(async () => {
  try {
    const data = await fetchAiModeStatus()
    isAiEnabled.value = data.is_ai_mode_enabled
  } catch (err) {
    console.error('Failed to fetch AI mode status', err)
  }
})

// Composables
const { profile, uploadPicture, isUploadingPicture, isLoading: isLoadingProfile, updateProfile, isUpdatingProfile } = useProfile()
const { sectors, allRoles, isLoading: isLoadingJobRoles } = useJobRole()
const { data: cvLinkData } = useCVDownloadLink()
const uploadMutation = useUploadCV()
const upload = uploadMutation.mutate
const cvQuery = useParsedCV()
const confirmMutation = useConfirmCV()
const confirm = confirmMutation.mutate

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
    const mainGroups = sectors.value.map(sector => ({
      type: 'group',
      label: sector.name,
      key: sector.id,
      children: allRoles.value
        .filter(role => role.sector_id === sector.id)
        .map(role => {
           // We don't strictly set roleNamesInGroups here to allow the normal structure 
           // but normally selection will highlight the existing option if values match.
           return { label: role.name, value: role.id }
        })
    }))
    options.push(...mainGroups)
  }

  return options
})

// Validation for job roles
const handleJobRolesUpdate = (value: string[]) => {
    if (value.length > 3) {
        errorFeedback.value = "You can only select a maximum of 3 job roles."
        formData.value.job_role_ids = value.slice(0, 3)
    } else {
        errorFeedback.value = ""
        formData.value.job_role_ids = value
    }
}


const fileList = ref<UploadFileInfo[]>([])
const pictureUploadRef = ref<any>(null)

const triggerPictureUpload = () => {
    pictureUploadRef.value?.$el?.querySelector('input')?.click()
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
  job_role_ids: []
})

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
                successFeedback.value = "Profile picture updated!"
            },
            onError: (err: any) => {
                errorFeedback.value = err.message || "Failed to upload picture"
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
            if (profile.value.tech_stack)ts = JSON.parse(profile.value.tech_stack)
        } catch(e) {}

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
            provinsi_id: profile.value.kabupaten_kota_id?.includes('.') ? profile.value.kabupaten_kota_id.split('.')[0] : null
        }
    }
}

const submitUpload = () => {
  errorFeedback.value = ""
  successFeedback.value = ""
  const currentFile = fileList.value[0]?.file
  if (fileList.value.length > 0 && currentFile) {
    upload(currentFile, {
      onSuccess: () => {
        successFeedback.value = isAiEnabled.value 
          ? "Upload successful! Waiting for AI processing..." 
          : "Upload successful!"
        fileList.value = []
        forceShowUpload.value = false
        cvQuery.refetch() 
      },
      onError: (err: any) => {
        errorFeedback.value = err.message || "Upload failed"
      }
    })
  }
}

const onConfirm = () => {
  errorFeedback.value = ""
  successFeedback.value = ""
  try {
    confirm(formData.value, {
      onSuccess: () => {
        successFeedback.value = "Profile updated successfully!"
        showUpdateFlow.value = false
      },
      onError: (err: any) => {
         errorFeedback.value = err.message || "Failed to update profile"
      }
    })
  } catch(e) {
    errorFeedback.value = "An error occurred during update"
  }
}

const onUpdateProfile = () => {
    errorFeedback.value = ""
    successFeedback.value = ""
    
    // In this edit mode, we might want to manually set job_role_ids if they changed via applied_roles tags
    const body = { 
        ...formData.value,
        birthdate: formData.value.birthdate ? new Date(formData.value.birthdate).toISOString().split('T')[0] : null
    }
    
    updateProfile(body, {
        onSuccess: () => {
            successFeedback.value = "Profile updated successfully!"
            isEditing.value = false
        },
        onError: (err: any) => {
            errorFeedback.value = err.message || "Failed to update profile"
        }
    })
}

const currentStep = computed(() => {
  const cv = cvQuery.data.value?.data
  
  if (isEditing.value) return 'EDIT'

  // If AI is disabled, we never go to PARSING or REVIEW for newly uploaded CVs
  const isParsingOrWaiting = cv && (cv.status === 'UPLOADED' || cv.status === 'PARSING') && cv.parsed_data === null

  // If user explicitly chooses to update
  if (showUpdateFlow.value) {
    if (forceShowUpload.value || !cv) return 'UPLOAD'
    if (isAiEnabled.value && isParsingOrWaiting) return 'PARSING'
    if (isAiEnabled.value && cv.parsed_data) return 'REVIEW'
    return 'VIEW' // If AI disabled, go back to view after upload
  }

  // Onboarding / Initial flow
  if (!isProfileComplete.value) {
    if (!cv) return 'UPLOAD'
    if (isAiEnabled.value && isParsingOrWaiting) return 'PARSING'
    if (isAiEnabled.value && cv.parsed_data) return 'REVIEW'
    // If AI disabled, we might need a manual onboarding or just allow VIEW
  }

  return 'VIEW'
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
       } catch(e) {}
    }
    const parsed = { ...parsedDataObj }
    
    if (parsed.kabupaten_kota && typeof parsed.kabupaten_kota === 'string') {
       parsed.kabupaten_kota_id = parsed.kabupaten_kota
       if (parsed.kabupaten_kota.includes('.')) {
         parsed.provinsi_id = parsed.kabupaten_kota.split('.')[0]
       }
    }
    
    // Ensure arrays are initialized
    parsed.tech_stack = parsed.tech_stack || []
    parsed.applied_roles = parsed.applied_roles || []
    parsed.job_role_ids = parsed.job_role_ids || []
    parsed.gpa = Number(parsed.gpa) || 0
    parsed.years_experience = Number(parsed.years_experience) || 0

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
  <UserLayout>
    <!-- HERO HEADER -->
    <div class="bg-linear-to-br from-[#0f172a] to-[#1e293b] relative overflow-hidden py-12 px-8 text-white">
      <!-- Subtle Radial Glow -->
      <div class="absolute top-0 right-0 w-2/5 h-full bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_70%)] pointer-events-none"></div>
      
      <div class="max-w-7xl mx-auto flex items-center gap-8 relative z-1">
        <div class="relative group">
          <n-avatar
            round
            :size="140"
            :src="profile?.profile_picture || undefined"
            :fallback-src="'https://0.gravatar.com/avatar/0?d=mp'"
            class="border-4 border-white/20 shadow-2xl transition-all group-hover:scale-105"
          />
          <div 
            class="absolute bottom-1 right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-lg"
            @click="triggerPictureUpload"
          >
            <n-icon :component="Edit" size="18" class="text-gray-800" />
          </div>
          <n-upload
              ref="pictureUploadRef"
              :show-file-list="false"
              @change="handleProfilePictureUpload"
              class="hidden"
          />
        </div>
        <div class="flex-1">
          <h1 class="text-4xl font-extrabold tracking-tight">{{ profile?.name || 'Guest User' }}</h1>
          <p class="text-blue-300 text-xl font-medium mt-1">
            {{ (profile?.job_roles?.[0]?.name) || profile?.system_role_name || 'Candidate' }}
          </p>
          <div class="flex items-center gap-3 mt-4">
             <n-tag type="success" round inverted size="small">
                <template #icon><div class="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse" /></template>
                Available
             </n-tag>
          </div>
        </div>
        <div class="flex items-center gap-4">
           <n-button type="primary" color="#0014B2" size="large" @click="startUpdateFlow" class="shadow-xl">
              <template #icon><n-icon :component="CloudUpload" /></template>
              Update CV
           </n-button>
           <n-button type="error" @click="logout()" size="large" class="text-white border-white/30 hover:bg-white/10">
              Logout
           </n-button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto p-8 mt-[-40px]">
      <!-- Feedback Alerts -->
      <div v-if="errorFeedback" class="mb-4">
        <n-alert title="Error" type="error" closable @close="errorFeedback=''">
          {{ errorFeedback }}
        </n-alert>
      </div>
      <div v-if="successFeedback" class="mb-4">
        <n-alert title="Success" type="success" closable @close="successFeedback=''">
          {{ successFeedback }}
        </n-alert>
      </div>

      <!-- Loading State -->
      <n-spin :show="isLoadingProfile || cvQuery.isPending.value || isUploadingPicture">
        
        <!-- PROFILE VIEW (Default if complete and not updating) -->
        <div v-if="currentStep === 'VIEW'">
          <n-grid :cols="24" :x-gap="32" :y-gap="32" item-responsive responsive="screen">
            <!-- Sidebar Navigation -->
            <n-gi span="24 m:6" class="mt-8">
              <n-card :bordered="false" class="shadow-sm sticky top bg-white/80 backdrop-blur-sm rounded-[1.25rem]!">
                <div class="py-2">
                  <h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-4 mb-4">Menu</h3>
                  <div class="space-y-1">
                    <div class="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 bg-blue-50 text-primary border border-blue-200 font-medium">
                      <n-icon :component="User" size="18" />
                      <span>Profile</span>
                    </div>
                    <div class="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 text-slate-500 font-medium hover:bg-slate-100 hover:text-slate-900 border border-transparent">
                      <n-icon :component="Message" size="18" />
                      <span>Message</span>
                    </div>
                    <div class="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 text-slate-500 font-medium hover:bg-slate-100 hover:text-slate-900 border border-transparent">
                      <n-icon :component="Briefcase" size="18" />
                      <span>Recruitment</span>
                    </div>
                    <div class="flex justify-between items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 text-slate-500 font-medium hover:bg-slate-100 hover:text-slate-900 border border-transparent">
                      <div class="flex items-center gap-3">
                        <n-icon :component="Bell" size="18" />
                        <span>Notifications</span>
                      </div>
                      <n-tag type="error" round size="small" :bordered="false" class="w-5 h-5 flex justify-center p-0 rounded-full text-[10px] font-bold">1</n-tag>
                    </div>
                    <div class="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 text-slate-500 font-medium hover:bg-slate-100 hover:text-slate-900 border border-transparent">
                      <n-icon :component="Settings" size="18" />
                      <span>Account</span>
                    </div>
                  </div>
                </div>
              </n-card>
            </n-gi>

            <!-- Profile Detail Card -->
            <n-gi span="24 m:18" class="relative mt-8">
              <n-card :bordered="false" class="shadow-sm min-h-[800px] overflow-hidden bg-white/50 backdrop-blur-xl rounded-[1.25rem]!">
                <!-- Blurred State Overlay -->
                <div v-if="isProfileLocked" class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-md rounded-[1.25rem] p-12 text-center">
                   <div class="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
                      <n-icon :component="CloudUpload" size="40" />
                   </div>
                   <h2 class="text-3xl font-bold text-gray-800">Complete Your Profile</h2>
                   <p class="text-gray-500 mt-2 max-w-sm mb-8">
                     Wait until AI finish parsing your CV.
                   </p>
                </div>

                <div :class="{ 'blur-sm select-none pointer-events-none grayscale-40': isProfileLocked }">
                  <div class="flex justify-between items-center mb-10 pb-4 border-b border-gray-100">
                    <h2 class="text-2xl font-bold text-primary">Your Profile</h2>
                    <n-button type="primary" color="#0014B2" size="small" @click="startEditing" class="font-bold">
                       <template #icon><n-icon :component="Edit" /></template>
                       Edit Profile
                    </n-button>
                  </div>

                  <div class="space-y-12">
                    <!-- Personal Information -->
                    <section>
                       <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Personal Information</h3>
                       
                       <div class="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                          <div class="col-span-1 md:col-span-2 mb-4">
                             <p class="text-sm font-bold text-primary mb-3">Photo Profile</p>
                             <n-avatar
                                round
                                :size="100"
                                :src="profile?.profile_picture || undefined"
                                :fallback-src="'https://0.gravatar.com/avatar/0?d=mp'"
                                class="shadow-lg border-2 border-white"
                             />
                          </div>

                          <div class="space-y-1">
                            <p class="text-sm font-bold text-primary">Date of Birth</p>
                            <p class="text-[17px] font-bold text-gray-800">{{ formatDate(profile?.birthdate) }} <span v-if="age" class="text-gray-400 font-medium ml-2">({{ age }} Years Old)</span></p>
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
                       <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Education</h3>
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
                       <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Location</h3>
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
                               {{ provinsiOptions.find((p: any) => p.value === (profile?.kabupaten_kota_id?.split('.')[0]))?.label || '-' }}
                            </p>
                          </div>
                       </div>
                    </section>

                    <!-- Professional Information -->
                    <section>
                       <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Professional Information</h3>
                       <div class="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                          <div class="space-y-1">
                            <p class="text-sm font-bold text-primary">Bidang Minat</p>
                            <p class="text-[17px] font-bold text-gray-800">{{ profile?.bidang || '-' }}</p>
                          </div>
                          <div class="space-y-1">
                            <p class="text-sm font-bold text-primary">Applied Role</p>
                            <p class="text-[17px] font-bold text-gray-800">
                               {{ profile?.job_roles?.map((r: any) => r.name).join(', ') || '-' }}
                            </p>
                          </div>
                          <div class="space-y-1">
                            <p class="text-sm font-bold text-primary">Pengalaman Kerja</p>
                            <p class="text-[17px] font-bold text-gray-800">{{ profile?.years_experience || 0 }} Tahun</p>
                          </div>
                          <div class="col-span-1 md:col-span-2 space-y-3 pt-2">
                            <p class="text-sm font-bold text-primary">Keahlian</p>
                            <div class="flex flex-wrap gap-2">
                               <n-tag v-for="skill in techStackList" :key="skill" type="primary" size="small" round secondary class="bg-blue-50 font-bold border-blue-100">
                                  {{ skill }}
                               </n-tag>
                            </div>
                          </div>
                       </div>
                    </section>

                    <!-- Portfolio -->
                    <section>
                        <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Portfolio</h3>
                        <div class="space-y-1">
                            <p class="text-sm font-bold text-primary">Link Portofolio</p>
                            <div v-if="profile?.portofolio_link" class="flex items-center gap-2">
                               <n-icon :component="ExternalLink" class="text-blue-500" />
                               <a :href="profile.portofolio_link" target="_blank" class="text-[17px] font-bold text-blue-600 hover:underline">
                                  {{ profile.portofolio_link.replace(/^https?:\/\//, '') }}
                               </a>
                            </div>
                            <p v-else class="text-[17px] font-bold text-gray-800">-</p>
                        </div>
                    </section>
                    
                    <!-- CV -->
                    <section v-if="cvLinkData?.data?.url">
                       <h3 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Curriculum Vitae</h3>
                       <div class="p-5 border border-gray-200 rounded-2xl flex items-center justify-between hover:border-blue-300 transition-colors group cursor-pointer" @click="downloadCV">
                          <div class="flex items-center gap-4">
                             <div class="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center border border-red-100 group-hover:bg-red-500 group-hover:text-white transition-all">
                                <n-icon :component="FileText" size="28" />
                             </div>
                             <div>
                                <p class="font-bold text-gray-800 text-[16px]">{{ cvLinkData.data.name || 'Professional_CV.pdf' }}</p>
                                <p class="text-[12px] text-gray-400 font-medium">PDF Document &bull; Verified</p>
                             </div>
                          </div>
                          <div class="flex items-center gap-4 text-gray-400">
                             <n-icon :component="Eye" size="18" class="hover:text-blue-500 cursor-pointer" />
                             <n-icon :component="Download" size="18" class="hover:text-blue-500 cursor-pointer" />
                          </div>
                       </div>
                    </section>
                  </div>
                </div>
              </n-card>
            </n-gi>
          </n-grid>
        </div>

        <!-- 1. Upload Phase -->
        <div v-if="currentStep === 'UPLOAD'">
           <div class="flex items-center justify-between mb-8 mt-8">
                <div class="flex items-center gap-4">
                    <n-button v-if="isProfileComplete" circle @click="showUpdateFlow = false" class="shadow-sm">
                        <template #icon><n-icon :component="ArrowLeft" /></template>
                    </n-button>
                </div>
           </div>

           <n-card :bordered="false" class="shadow-xl rounded-2xl text-center p-10 bg-white">
            <div class="mb-8 flex flex-col items-center">
                <div class="w-24 h-24 bg-primary/5 rounded-3xl flex items-center justify-center text-primary mb-5 shadow-inner">
                    <n-icon size="48" :component="CloudUpload" />
                </div>
                <h2 class="text-3xl font-extrabold text-gray-900">Let's update your CV</h2>
                <p class="text-gray-500 max-w-md mx-auto mt-3 text-lg leading-relaxed">
                    Upload your latest resume. Our AI assistant will automatically update your profile skills, education, and experience.
                </p>
            </div>

            <n-upload
              :default-upload="false"
              v-model:file-list="fileList"
              @change="handleUploadChange"
              accept=".pdf,.doc,.docx"
              :max="1"d
              directory-dnd
            >
              <div class="border-dashed border-2 rounded-2xl p-10 border-gray-300 bg-gray-50/50 hover:bg-primary/10 hover:border-primary transition-all">
                <n-upload-dragger class="py-12 transition-all">
                  <div style="margin-bottom: 16px">
                    <n-icon size="56" class="text-gray-300" :component="CloudUpload" />
                  </div>
                  <h3 class="text-xl font-bold text-gray-700">Drop your file here</h3>
                  <p class="text-gray-500 mt-1">PDF, DOC, or DOCX files are supported</p>
                </n-upload-dragger>
              </div>
            </n-upload>

            <div class="mt-10">
                <n-button 
                    type="primary" 
                    size="large"
                    color="#0014B2" 
                    block
                    :loading="uploadMutation.isPending.value" 
                    :disabled="fileList.length === 0" 
                    @click="submitUpload"
                    class="h-14 text-xl font-extrabold shadow-lg rounded-xl"
                >
                    Extract CV Data with AI
                </n-button>
            </div>
           </n-card>
        </div>

        <!-- 2. Parsing Phase -->
        <div v-if="currentStep === 'PARSING'">
           <n-card :bordered="false" class="shadow-xl rounded-2xl p-16 text-center bg-white">
            <div class="flex flex-col items-center">
                <n-spin size="large" class="mb-8" />
                <h2 class="text-3xl font-extrabold text-gray-900">AI Analyzer is at work</h2>
                <p class="text-gray-500 mt-3 text-lg max-w-md">
                    We are currently extracting structured data from your document. Please wait a moment...
                </p>
                <div class="mt-8 flex gap-2">
                    <div class="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div class="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
            </div>
           </n-card>
        </div>

        <!-- 3. Review/Confirm Phase (Unified with Direct Edit) -->
        <div v-if="['REVIEW', 'EDIT'].includes(currentStep)">
           <div class="mb-8 mt-8 flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold tracking-tight">{{ currentStep === 'EDIT' ? 'Edit Your Profile' : 'Review Your Profile' }}</h1>
                    <p class="text-gray-500 mt-1">{{ currentStep === 'EDIT' ? 'Make changes to your professional information.' : 'Please verify the information extracted by our AI assistant.' }}</p>
                </div>
                <n-tag v-if="currentStep === 'REVIEW'" type="success" size="large" round strong shadow>
                    <template #icon><n-icon :component="MapPin" /></template>
                    AI Parsing Successful
                </n-tag>
                <n-button v-else circle @click="isEditing = false" class="shadow-sm">
                    <template #icon><n-icon :component="ArrowLeft" /></template>
                </n-button>
           </div>
           
           <n-card :bordered="false" class="shadow-xl rounded-2xl overflow-hidden mb-10">
              <n-form :model="formData" label-placement="top" size="large" class="p-4">
                 <div class="space-y-8">
                    <section>
                        <h3 class="text-sm font-bold text-primary uppercase tracking-widest mb-6 border-b pb-2">Personal Information</h3>
                        <n-grid :cols="2" :x-gap="24">
                            <n-gi span="2">
                                <n-form-item label="Full Name">
                                    <n-input v-model:value="formData.name" placeholder="Enter your full name" />
                                </n-form-item>
                            </n-gi>
                            <n-gi span="1">
                                <n-form-item label="Date of Birth">
                                    <n-date-picker v-model:value="formData.birthdate" type="date" class="w-full" clearable />
                                </n-form-item>
                            </n-gi>
                            <n-gi span="1">
                                <n-form-item label="Phone Number">
                                    <n-input v-model:value="formData.phone_number" placeholder="+62..." />
                                </n-form-item>
                            </n-gi>
                            <n-gi span="2">
                                <n-form-item label="Portfolio Link">
                                    <n-input v-model:value="formData.portofolio_link" placeholder="https://..." />
                                </n-form-item>
                            </n-gi>
                        </n-grid>
                    </section>

                    <section>
                        <h3 class="text-sm font-bold text-primary uppercase tracking-widest mb-6 border-b pb-2">Academic Background</h3>
                        <n-grid :cols="2" :x-gap="24">
                            <n-gi span="1">
                                <n-form-item label="Institution Name">
                                    <n-input v-model:value="formData.school_university" />
                                </n-form-item>
                            </n-gi>
                            <n-gi span="1">
                                <n-form-item label="Field of Study">
                                    <n-input v-model:value="formData.major" />
                                </n-form-item>
                            </n-gi>
                            <n-gi span="1">
                                <n-form-item label="GPA (Cumulative)">
                                    <n-input-number v-model:value="formData.gpa" :step="0.01" :min="0" :max="4" class="w-full" />
                                </n-form-item>
                            </n-gi>
                        </n-grid>
                    </section>

                    <section>
                        <h3 class="text-sm font-bold text-primary uppercase tracking-widest mb-6 border-b pb-2">Professional Details</h3>
                        <n-grid :cols="2" :x-gap="24">
                            <n-gi span="1">
                                <n-form-item label="Years of Professional Experience">
                                    <n-input-number v-model:value="formData.years_experience" :min="0" class="w-full" />
                                </n-form-item>
                            </n-gi>
                            <n-gi span="1">
                                <n-form-item label="Current Province (Location)">
                                    <n-select
                                        v-model:value="formData.provinsi_id"
                                        :options="provinsiOptions"
                                        :loading="provQuery.isPending.value"
                                        placeholder="Select Province"
                                        filterable
                                        clearable
                                        @update:value="formData.kabupaten_kota_id = null"
                                    />
                                </n-form-item>
                            </n-gi>
                            <n-gi span="1 m:2">
                                <n-form-item label="City / Kabupaten">
                                    <n-select
                                        v-model:value="formData.kabupaten_kota_id"
                                        :options="kabupatenOptions"
                                        :loading="kabQuery.isPending.value"
                                        :disabled="!formData.provinsi_id"
                                        placeholder="Select City / Kabupaten"
                                        filterable
                                        clearable
                                    />
                                </n-form-item>
                            </n-gi>
                        </n-grid>
                    </section>

                    <section>
                        <h3 class="text-sm font-bold text-primary uppercase tracking-widest mb-6 border-b pb-2">Skills & Expertise</h3>
                        <div class="space-y-6">
                            <n-form-item label="Professional Roles (Select up to 3)">
                                <n-select
                                    :key="allRoles?.length || 0"
                                    v-model:value="formData.job_role_ids"
                                    multiple
                                    :max-tag-count="3"
                                    :options="jobRoleOptions"
                                    placeholder="Select your primary roles"
                                    :loading="isLoadingJobRoles"
                                    @update:value="handleJobRolesUpdate"
                                />
                            </n-form-item>
                            <n-form-item label="Tech Stack / Key Skills">
                                <n-dynamic-tags v-model:value="formData.tech_stack" />
                            </n-form-item>
                        </div>
                    </section>

                    <section>
                        <h3 class="text-sm font-bold text-primary uppercase tracking-widest mb-6 border-b pb-2">About Me</h3>
                        <n-form-item :label="currentStep === 'REVIEW' ? 'AI-Generated Professional Summary' : 'Professional Summary'">
                            <n-input v-model:value="formData.summary" type="textarea" :rows="5" placeholder="Summary of your professional profile..." />
                        </n-form-item>
                    </section>
                 </div>

                 <div class="flex justify-between items-center mt-12 pt-8 border-t">
                    <n-button ghost @click="currentStep === 'REVIEW' ? startUpdateFlow() : (isEditing = false)" size="large">
                        {{ currentStep === 'REVIEW' ? 'Re-upload CV' : 'Cancel' }}
                    </n-button>
                    <n-button 
                        type="primary" 
                        color="#0014B2"
                        size="large" 
                        :loading="confirmMutation.isPending.value || isUpdatingProfile" 
                        @click="currentStep === 'REVIEW' ? onConfirm() : onUpdateProfile()"
                        class="px-16 h-14 text-xl font-bold rounded-xl shadow-lg"
                    >
                        {{ currentStep === 'REVIEW' ? 'Save & Update Profile' : 'Save Changes' }}
                    </n-button>
                 </div>
              </n-form>
           </n-card>
        </div>

      </n-spin>
    </div>
  </UserLayout>
</template>
