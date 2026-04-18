<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import UserLayout from '@/layouts/UserLayout.vue'
import { useUploadCV, useParsedCV, useConfirmCV, useCVDownloadLink } from '@/composables/useCV'
import { useProvinsi, useKabupaten } from '@/composables/useRegion'
import { useLogout } from '@/composables/useAuth'
import { useProfile } from '@/composables/useProfile'
import { useJobRole } from '@/composables/useJobRole'
import { 
  NUpload, NButton, NCard, NForm, NFormItem, NInput, 
  NInputNumber, NDynamicTags, NSelect, NSpin, NAlert,
  NAvatar, NGrid, NGi, NStatistic, NTag, NDivider, NIcon,
  NEmpty, NSpace
} from 'naive-ui'
import { 
  CloudUpload, 
  Download, 
  Edit, 
  User,
  School,
  Briefcase,
  MapPin,
  Code,
  ArrowLeft
} from '@vicons/tabler'
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

  // 1. Always include a group for currently selected roles to guarantee names are shown immediately
  if (profile.value?.job_roles?.length) {
    options.push({
      type: 'group',
      label: 'Selected Roles',
      key: 'selected-roles-group',
      children: profile.value.job_roles.map((r: any) => ({
        label: r.name,
        value: r.id
      }))
    })
  }

  // 2. Add the industry-grouped categories once the API returns data
  if (sectors.value && allRoles.value) {
    const mainGroups = sectors.value.map(sector => ({
      type: 'group',
      label: sector.name,
      key: sector.id,
      children: allRoles.value
        .filter(role => role.sector_id === sector.id)
        .map(role => ({
          label: role.name,
          value: role.id
        }))
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

const getRoleName = (id: string) => {
  return allRoles.value?.find(r => r.id === id)?.name || id
}

const fileList = ref<UploadFileInfo[]>([])
const pictureUploadRef = ref<any>(null)

const triggerPictureUpload = () => {
    pictureUploadRef.value?.$el?.querySelector('input')?.click()
}

const formData = ref<Record<string, any>>({
  name: "",
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
        successFeedback.value = "Upload successful! Waiting for AI processing..."
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
    // But since dynamic tags for applied_roles is usually for names, it's better if we just use job_role_ids if we had a selector.
    // For now let's just send what we have.
    
    updateProfile(formData.value, {
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

  // If user explicitly chooses to update
  if (showUpdateFlow.value) {
    if (forceShowUpload.value || !cv) return 'UPLOAD'
    if (cv.status === 'UPLOADED' || (cv.status === 'PARSING' && cv.parsed_data === null)) return 'PARSING'
    if (cv.parsed_data) return 'REVIEW'
    return 'UPLOAD'
  }

  // Onboarding / Initial flow
  if (!isProfileComplete.value) {
    if (!cv) return 'UPLOAD'
    if (cv.status === 'UPLOADED' || (cv.status === 'PARSING' && cv.parsed_data === null)) return 'PARSING'
    if (cv.parsed_data) return 'REVIEW'
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

    formData.value = { ...formData.value, ...parsed }
  }
}, { immediate: true, deep: true })
</script>

<template>
  <UserLayout>
    <div class="max-w-5xl mx-auto p-6 mt-6">
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
          <div class="flex justify-between items-start mb-8">
            <div class="flex items-center gap-6">
              <div class="relative group cursor-pointer" @click="triggerPictureUpload">
                <n-avatar
                  round
                  :size="110"
                  :src="profile?.profile_picture || undefined"
                  :fallback-src="'https://0.gravatar.com/avatar/0?d=mp'"
                  class="border-4 border-white shadow-xl transition-all group-hover:opacity-80"
                />
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-full">
                    <n-icon :component="Edit" size="30" class="text-white" />
                </div>
                <n-upload
                    ref="pictureUploadRef"
                    :show-file-list="false"
                    @change="handleProfilePictureUpload"
                    class="hidden"
                />
              </div>
              <div>
                <h1 class="text-3xl font-bold text-gray-800 tracking-tight">{{ profile?.name }}</h1>
                <p class="text-gray-500 flex items-center gap-2 mt-1 font-medium">
                  <n-icon :component="Briefcase" />
                  {{ profile?.system_role_name }} &bull; Candidate
                </p>
                <div class="flex gap-3 mt-4">
                   <n-button type="primary" size="medium" @click="startUpdateFlow" class="shadow-sm">
                      <template #icon><n-icon :component="CloudUpload" /></template>
                      Update CV
                   </n-button>
                   <n-button type="primary" secondary size="medium" @click="startEditing" class="shadow-sm">
                      <template #icon><n-icon :component="Edit" /></template>
                      Edit Profile
                   </n-button>
                   <n-button type="primary" tertiary size="medium" @click="downloadCV" :disabled="!cvLinkData?.data?.url" class="shadow-sm">
                      <template #icon><n-icon :component="Download" /></template>
                      Download CV
                   </n-button>
                </div>
              </div>
            </div>
            <n-button @click="logout()" type="error" ghost size="medium">Logout</n-button>
          </div>

          <n-grid :cols="24" :x-gap="24" :y-gap="24" item-responsive responsive="screen">
            <!-- Basic Info Card -->
            <n-gi span="24 m:16">
              <n-card title="Professional Profile" :bordered="false" class="shadow-sm rounded-2xl bg-white/80 backdrop-blur-sm">
                 <div class="space-y-8 p-2">
                    <div>
                        <div class="flex items-center gap-2 mb-4">
                            <n-icon :component="School" size="20" class="text-primary" />
                            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest">Education</h3>
                        </div>
                        <div class="flex items-start gap-5">
                            <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-primary shrink-0">
                                <n-icon size="28" :component="School" />
                            </div>
                            <div class="flex-1">
                                <p class="font-bold text-xl text-gray-800 leading-tight">{{ profile?.school_university }}</p>
                                <p class="text-gray-600 text-lg mt-1 font-medium">{{ profile?.major }}</p>
                                <div class="flex items-center gap-4 mt-3">
                                    <n-tag type="info" size="small" round strong secondary>
                                        GPA: {{ profile?.gpa?.toFixed(2) }} / 4.00
                                    </n-tag>
                                </div>
                            </div>
                        </div>
                    </div>

                    <n-divider dashed />

                    <div>
                        <div class="flex items-center gap-2 mb-4">
                            <n-icon :component="Code" size="20" class="text-primary" />
                            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest">Skills & Tech Stack</h3>
                        </div>
                        <div class="flex flex-wrap gap-2.5">
                           <n-tag v-for="skill in techStackList" :key="skill" type="primary" round secondary class="px-3">
                               <template #icon>
                                   <n-icon :component="Code" />
                               </template>
                               {{ skill }}
                           </n-tag>
                           <n-empty v-if="techStackList.length === 0" size="small" description="No skills listed yet" />
                        </div>
                    </div>
                    
                    <n-divider dashed />

                    <div>
                        <div class="flex items-center gap-2 mb-4">
                            <n-icon :component="Briefcase" size="20" class="text-primary" />
                            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest">Targeted Job Roles</h3>
                        </div>
                        <n-spin :show="isLoadingJobRoles" size="small">
                            <div class="flex flex-wrap gap-2.5">
                            <n-tag v-for="role in profile?.job_roles" :key="typeof role === 'string' ? role : role.id" type="success" round secondary class="px-3">
                                <template #icon>
                                    <n-icon :component="Briefcase" />
                                </template>
                                {{ typeof role === 'string' ? getRoleName(role) : role.name }}
                            </n-tag>
                            <n-empty v-if="(!profile?.job_roles || profile?.job_roles.length === 0) && !isLoadingJobRoles" size="small" description="No targeted roles selected" />
                            </div>
                        </n-spin>
                    </div>

                    <n-divider dashed />

                    <div v-if="profile?.years_experience !== null">
                        <div class="flex items-center gap-2 mb-4">
                            <n-icon :component="Briefcase" size="20" class="text-primary" />
                            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest">Experience</h3>
                        </div>
                        <div class="flex items-center gap-5">
                             <div class="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 shrink-0">
                                <n-icon size="28" :component="Briefcase" />
                             </div>
                             <div>
                                <p class="text-xl font-bold text-gray-800">{{ profile?.years_experience }} Years</p>
                                <p class="text-gray-600 font-medium">Total professional experience</p>
                             </div>
                        </div>
                    </div>
                 </div>
              </n-card>
            </n-gi>

            <!-- Sidebar Info -->
            <n-gi span="24 m:8">
              <n-space vertical :size="24">
                <n-card title="Contact & Location" :bordered="false" class="shadow-sm rounded-2xl">
                    <n-statistic label="Email Address">
                        <template #prefix>
                            <n-icon :component="User" size="16" class="mt-1 mr-1" />
                        </template>
                        <span class="text-sm font-semibold text-gray-700">{{ profile?.email }}</span>
                    </n-statistic>
                    <n-divider class="my-4" />
                    <n-statistic label="Current Location">
                        <template #prefix>
                            <n-icon :component="MapPin" size="18" class="text-red-500 mr-2" />
                        </template>
                        <span class="text-sm font-bold text-gray-800">{{ profile?.kabupaten_kota_id ? 'Location Registered' : 'Not Specified' }}</span>
                    </n-statistic>
                </n-card>

                <n-card title="Account Summary" :bordered="false" class="shadow-sm rounded-2xl bg-linear-to-br from-white to-gray-50">
                   <div class="space-y-4">
                       <div class="flex items-center justify-between">
                           <span class="text-gray-500 font-medium">Profile Status</span>
                           <n-tag :type="profile?.account_status === 'Active' ? 'success' : 'warning'" round strong>
                               {{ profile?.account_status }}
                           </n-tag>
                       </div>
                       <div class="flex items-center justify-between">
                           <span class="text-gray-500 font-medium">CV Availability</span>
                           <n-tag :type="cvLinkData?.data?.url ? 'primary' : 'default'" round secondary>
                               {{ cvLinkData?.data?.url ? 'Generated' : 'Not Uploaded' }}
                           </n-tag>
                       </div>
                   </div>
                </n-card>
              </n-space>
            </n-gi>
          </n-grid>
        </div>

        <!-- 1. Upload Phase -->
        <div v-if="currentStep === 'UPLOAD'">
           <div class="flex items-center justify-between mb-8">
                <div class="flex items-center gap-4">
                    <n-button v-if="isProfileComplete" circle @click="showUpdateFlow = false" class="shadow-sm">
                        <template #icon><n-icon :component="ArrowLeft" /></template>
                    </n-button>
                    <h1 class="text-3xl font-bold tracking-tight">Update Professional CV</h1>
                </div>
                <n-button @click="logout()" type="error" ghost>Logout</n-button>
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
              :max="1"
              directory-dnd
            >
              <n-upload-dragger class="py-12 bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-2xl transition-all hover:bg-white hover:border-primary">
                <div style="margin-bottom: 16px">
                  <n-icon size="56" class="text-gray-300" :component="CloudUpload" />
                </div>
                <h3 class="text-xl font-bold text-gray-700">Drop your file here</h3>
                <p class="text-gray-500 mt-1">PDF, DOC, or DOCX files are supported</p>
              </n-upload-dragger>
            </n-upload>

            <div class="mt-10">
                <n-button 
                    type="primary" 
                    size="large" 
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
           <div class="mb-8 flex items-center justify-between">
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

<style scoped>
:deep(.n-card) {
  border-radius: 1rem;
}
:deep(.n-button) {
  border-radius: 0.5rem;
}
</style>
