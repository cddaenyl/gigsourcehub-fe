import axios, { AxiosError } from "axios"

export const uploadCV = async (file: File, skipParsing?: boolean) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    const url = skipParsing ? "/cv/upload?skip_parsing=true" : "/cv/upload"
    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const getParsedCV = async () => {
    try {
      const response = await axios.get("/cv/parsed")
      return response.data
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
}

export const confirmCV = async (editedData: Record<string, any>) => {
    try {
      const response = await axios.post("/cv/confirm", {
          edited_data: editedData
      })
      return response.data
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
}

export interface CVPrivateResp {
    id: string
    name: string
    url: string
}

export interface CVDownloadResponse {
    status: number
    message: string
    data: CVPrivateResp
}

export const getCVDownloadLinkApi = async (): Promise<CVDownloadResponse> => {
    try {
      const response = await axios.get<CVDownloadResponse>("/cv/generate")
      return response.data
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
}
