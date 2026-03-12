import { defineStore } from 'pinia'
import { addBookmarkApi, removeBookmarkApi } from '@/services/user.service'

export const useBookmarkStore = defineStore('bookmark', {
  state: () => ({
    bookmarkedCandidates: new Set<string>(), // Using Set for efficient lookup
    isLoading: false,
  }),

  getters: {
    isBookmarked: (state) => (userId: string) => {
      return state.bookmarkedCandidates.has(userId)
    },
    bookmarkedCount: (state) => state.bookmarkedCandidates.size,
  },

  actions: {
    // Initialize bookmarks from user data
    initializeBookmarks(users: Array<{ id: string; is_bookmark: boolean }>) {
      this.bookmarkedCandidates.clear()
      users.forEach((user) => {
        if (user.is_bookmark) {
          this.bookmarkedCandidates.add(user.id)
        }
      })
    },

    // Toggle bookmark for a candidate
    async toggleBookmark(userId: string) {
      this.isLoading = true
      const isCurrentlyBookmarked = this.bookmarkedCandidates.has(userId)

      try {
        // Call appropriate API based on current state
        if (isCurrentlyBookmarked) {
          await removeBookmarkApi(userId)
          this.bookmarkedCandidates.delete(userId)
        } else {
          await addBookmarkApi(userId)
          this.bookmarkedCandidates.add(userId)
        }
      } catch (error) {
        console.error('Failed to toggle bookmark:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Add bookmark (optimistic update)
    addBookmark(userId: string) {
      this.bookmarkedCandidates.add(userId)
    },

    // Remove bookmark (optimistic update)
    removeBookmark(userId: string) {
      this.bookmarkedCandidates.delete(userId)
    },

    // Clear all bookmarks
    clearBookmarks() {
      this.bookmarkedCandidates.clear()
    },
  },
})
