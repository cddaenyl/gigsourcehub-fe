import axios from 'axios'

export interface SystemSetting {
  id: string
  is_ai_mode_enabled: boolean
}

export const fetchSystemSettings = async (): Promise<SystemSetting> => {
  const { data } = await axios.get('/system-settings')
  return data.data
}

export const fetchAiModeStatus = async (): Promise<{ is_ai_mode_enabled: boolean }> => {
  const { data } = await axios.get('/system-settings/ai-mode')
  return data.data
}

export const updateSystemSettings = async (payload: { is_ai_mode_enabled: boolean }) => {
  const { data } = await axios.put('/system-settings', payload)
  return data
}
