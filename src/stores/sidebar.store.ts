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
      // Remove dashboard namespace prefix (/admin or /employee)
      const cleanPath = path.replace(/^\/(admin|employee)\/?/, '')

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
      } else if (cleanPath.startsWith('interview-schedule')) {
        this.activeKey = 'interview-schedule'
        if (!this.expandedKeys.includes('kandidat')) {
          this.expandedKeys.push('kandidat')
        }
      } else if (cleanPath.startsWith('candidate-chat')) {
        this.activeKey = 'candidate-chat'
        if (!this.expandedKeys.includes('kandidat')) {
          this.expandedKeys.push('kandidat')
        }
      } else if (cleanPath.startsWith('talent-needs')) {
        // Keep menu highlight on parent item for nested employee/admin talent-needs routes
        this.activeKey = 'talent-needs'
      } else if (cleanPath.startsWith('candidate-list')) {
        this.activeKey = 'candidate-list'
      } else {
        // For top-level routes
        const firstSegment = cleanPath.split('/')[0]
        this.activeKey = firstSegment || 'dashboard'
      }
    },
  },
})
