import axios, { AxiosError } from 'axios'
import type { CreateNotePayload, CreateNoteResponse, NotesResponse } from '@/models/Note'

export const getNotesApi = async (candidateUserId: string): Promise<NotesResponse> => {
  try {
    const response = await axios.get<NotesResponse>(`/notes/${candidateUserId}`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}

export const createNoteApi = async (
  candidateUserId: string,
  payload: CreateNotePayload,
): Promise<CreateNoteResponse> => {
  try {
    const response = await axios.post<CreateNoteResponse>(`/notes/${candidateUserId}`, payload)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    throw error
  }
}
