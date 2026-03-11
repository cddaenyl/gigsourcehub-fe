import { defineStore } from 'pinia'

export const useSidebarStore = defineStore('sidebar', {
  state: () => ({
    activeKey: 'dashboard' as string | null,
    expandedKeys: [] as string[],
  }),

  getters: {
    isExpanded: (state) => (key: string) => {
      return state.expandedKeys.includes(key)
    },
  },

  actions: {
    setActiveKey(key: string | null) {
      this.activeKey = key
    },

    setExpandedKeys(keys: string[]) {
      this.expandedKeys = keys
    },

    toggleExpanded(key: string) {
      const index = this.expandedKeys.indexOf(key)
      if (index > -1) {
        this.expandedKeys.splice(index, 1)
      } else {
        this.expandedKeys.push(key)
      }
    },

    // Helper to set active state from route path
    setActiveFromRoute(path: string) {
      // Remove /admin/ prefix and get the first segment
      const cleanPath = path.replace(/^\/admin\/?/, '')

      if (!cleanPath || cleanPath === '') {
        this.activeKey = 'dashboard'
        return
      }

      // Handle nested routes
      if (cleanPath.startsWith('daftar-kandidat')) {
        this.activeKey = 'daftar-kandidat'
        if (!this.expandedKeys.includes('kandidat')) {
          this.expandedKeys.push('kandidat')
        }
      } else if (cleanPath.startsWith('jadwal-interview')) {
        this.activeKey = 'jadwal-interview'
        if (!this.expandedKeys.includes('kandidat')) {
          this.expandedKeys.push('kandidat')
        }
      } else if (cleanPath.startsWith('kandidat-chat')) {
        this.activeKey = 'kandidat-chat'
        if (!this.expandedKeys.includes('kandidat')) {
          this.expandedKeys.push('kandidat')
        }
      } else {
        // For top-level routes
        const firstSegment = cleanPath.split('/')[0]
        this.activeKey = firstSegment || 'dashboard'
      }
    },
  },
})
