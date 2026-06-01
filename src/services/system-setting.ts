import axios from 'axios'

export interface SystemSetting {
  id: string
  is_ai_mode_enabled: boolean
  cv_template_path?: string
  cv_template_url?: string
}

export const fetchSystemSettings = async (): Promise<SystemSetting> => {
  const { data } = await axios.get('/system-settings')
  return data.data
}

export const fetchAiModeStatus = async (): Promise<{ is_ai_mode_enabled: boolean; cv_template_url?: string }> => {
  const { data } = await axios.get('/system-settings/ai-mode')
  return data.data
}

export const updateSystemSettings = async (payload: { is_ai_mode_enabled: boolean }) => {
  const { data } = await axios.put('/system-settings', payload)
  return data
}

export const uploadCvTemplate = async (file: File): Promise<{ cv_template_url: string }> => {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await axios.post('/system-settings/cv-template', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}
