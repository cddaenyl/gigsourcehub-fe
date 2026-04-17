import axios, { AxiosError } from "axios"

export const getProvinsi = async () => {
    try {
      const response = await axios.get("/provinsi")
      return response.data
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
}

export const getKabupaten = async (provinsiId: string) => {
    try {
      const response = await axios.get(`/kabupaten?provinsi_id=${provinsiId}`)
      return response.data
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
}
