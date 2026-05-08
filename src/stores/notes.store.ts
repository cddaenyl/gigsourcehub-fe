import { defineStore } from 'pinia'
import { createNoteApi, getNotesApi } from '@/services/notes.service'
import type { CandidateNote } from '@/models/Note'
import { useAuthStore } from '@/stores/auth.store'

type CandidateNoteView = CandidateNote & { isOptimistic?: boolean }

const toTimestamp = (value: string) => {
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

export const useCandidateNotesStore = defineStore('candidate-notes', {
  state: () => ({
    notes: [] as CandidateNoteView[],
    isLoading: false,
    isPosting: false,
    error: null as string | null,
  }),

  getters: {
    sortedNotes: (state) => {
      return [...state.notes].sort((a, b) => toTimestamp(a.created_at) - toTimestamp(b.created_at))
    },
  },

  actions: {
    reset() {
      this.notes = []
      this.isLoading = false
      this.isPosting = false
      this.error = null
    },

    async fetchNotes(candidateUserId: string) {
      this.isLoading = true
      this.error = null

      try {
        const response = await getNotesApi(candidateUserId)
        this.notes = Array.isArray(response.data) ? response.data : []
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Gagal memuat catatan.'
        this.error = message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async createNote(candidateUserId: string, content: string) {
      if (!content.trim()) return

      const authStore = useAuthStore()
      const now = new Date().toISOString()
      const tempId = `optimistic-${Date.now()}`
      const optimisticNote: CandidateNoteView = {
        id: tempId,
        admin_user_id: authStore.user?.id ?? '',
        admin_user_name: authStore.user?.name ?? 'Anda',
        candidate_user_id: candidateUserId,
        content,
        created_at: now,
        updated_at: now,
        isOptimistic: true,
      }

      this.isPosting = true
      this.error = null
      this.notes.push(optimisticNote)

      try {
        const response = await createNoteApi(candidateUserId, { content })
        const index = this.notes.findIndex((note) => note.id === tempId)
        if (index !== -1) {
          this.notes.splice(index, 1, response.data)
        } else {
          this.notes.push(response.data)
        }
        return response.data
      } catch (error) {
        this.notes = this.notes.filter((note) => note.id !== tempId)
        const message = error instanceof Error ? error.message : 'Gagal menambahkan catatan.'
        this.error = message
        throw error
      } finally {
        this.isPosting = false
      }
    },
  },
})
