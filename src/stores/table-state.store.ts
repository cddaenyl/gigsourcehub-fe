import { defineStore } from 'pinia'

const STORAGE_KEY = 'gigsourcehub_tables_state'

interface TableState {
  employeeTalentNeeds: {
    page: number
    pageSize: number
    search: string
  }
  employeeCandidateList: {
    tab: 'semua' | 'disimpan'
    page: number
    pageSize: number
    search: string
  }
  adminTalentNeeds: {
    tab: 'semua' | 'menunggu validasi' | 'tugas saya'
    page: number
    pageSize: number
    search: string
  }
  adminCandidateList: {
    tab: 'semua' | 'rekrutmen' | 'onboarding' | 'archive' | 'disimpan'
    page: number
    pageSize: number
    search: string
  }
  employeeMyTeam: {
    tab: 'aktif' | 'history'
    page: number
    pageSize: number
    search: string
  }
  adminInterviewSchedule: {
    tab: 'semua' | 'scheduled'
    page: number
    pageSize: number
  }
}

const getDefaultState = (): TableState => ({
  employeeTalentNeeds: {
    page: 1,
    pageSize: 10,
    search: '',
  },
  employeeCandidateList: {
    tab: 'semua',
    page: 1,
    pageSize: 10,
    search: '',
  },
  adminTalentNeeds: {
    tab: 'semua',
    page: 1,
    pageSize: 10,
    search: '',
  },
  adminCandidateList: {
    tab: 'semua',
    page: 1,
    pageSize: 10,
    search: '',
  },
  employeeMyTeam: {
    tab: 'aktif',
    page: 1,
    pageSize: 10,
    search: '',
  },
  adminInterviewSchedule: {
    tab: 'semua',
    page: 1,
    pageSize: 10,
  },
})

const loadState = (): TableState => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      return {
        employeeTalentNeeds: { ...getDefaultState().employeeTalentNeeds, ...parsed.employeeTalentNeeds },
        employeeCandidateList: { ...getDefaultState().employeeCandidateList, ...parsed.employeeCandidateList },
        adminTalentNeeds: { ...getDefaultState().adminTalentNeeds, ...parsed.adminTalentNeeds },
        adminCandidateList: { ...getDefaultState().adminCandidateList, ...parsed.adminCandidateList },
        employeeMyTeam: { ...getDefaultState().employeeMyTeam, ...parsed.employeeMyTeam },
        adminInterviewSchedule: { ...getDefaultState().adminInterviewSchedule, ...parsed.adminInterviewSchedule },
      }
    }
  } catch (e) {
    console.error('Failed to load table state from localStorage', e)
  }
  return getDefaultState()
}

export const useTableStateStore = defineStore('tableState', {
  state: () => loadState(),
  actions: {
    saveState() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.$state))
      } catch (e) {
        console.error('Failed to save table state to localStorage', e)
      }
    },
    setEmployeeTalentNeeds(state: { page?: number; pageSize?: number; search?: string }) {
      if (state.page !== undefined) this.employeeTalentNeeds.page = state.page
      if (state.pageSize !== undefined) this.employeeTalentNeeds.pageSize = state.pageSize
      if (state.search !== undefined) this.employeeTalentNeeds.search = state.search
      this.saveState()
    },
    setEmployeeCandidateList(state: { tab?: 'semua' | 'disimpan'; page?: number; pageSize?: number; search?: string }) {
      if (state.tab !== undefined) this.employeeCandidateList.tab = state.tab
      if (state.page !== undefined) this.employeeCandidateList.page = state.page
      if (state.pageSize !== undefined) this.employeeCandidateList.pageSize = state.pageSize
      if (state.search !== undefined) this.employeeCandidateList.search = state.search
      this.saveState()
    },
    setAdminTalentNeeds(state: { tab?: 'semua' | 'menunggu validasi' | 'tugas saya'; page?: number; pageSize?: number; search?: string }) {
      if (state.tab !== undefined) this.adminTalentNeeds.tab = state.tab
      if (state.page !== undefined) this.adminTalentNeeds.page = state.page
      if (state.pageSize !== undefined) this.adminTalentNeeds.pageSize = state.pageSize
      if (state.search !== undefined) this.adminTalentNeeds.search = state.search
      this.saveState()
    },
    setAdminCandidateList(state: { tab?: 'semua' | 'rekrutmen' | 'onboarding' | 'archive' | 'disimpan'; page?: number; pageSize?: number; search?: string }) {
      if (state.tab !== undefined) this.adminCandidateList.tab = state.tab
      if (state.page !== undefined) this.adminCandidateList.page = state.page
      if (state.pageSize !== undefined) this.adminCandidateList.pageSize = state.pageSize
      if (state.search !== undefined) this.adminCandidateList.search = state.search
      this.saveState()
    },
    setEmployeeMyTeam(state: { tab?: 'aktif' | 'history'; page?: number; pageSize?: number; search?: string }) {
      if (state.tab !== undefined) this.employeeMyTeam.tab = state.tab
      if (state.page !== undefined) this.employeeMyTeam.page = state.page
      if (state.pageSize !== undefined) this.employeeMyTeam.pageSize = state.pageSize
      if (state.search !== undefined) this.employeeMyTeam.search = state.search
      this.saveState()
    },
    setAdminInterviewSchedule(state: { tab?: 'semua' | 'scheduled'; page?: number; pageSize?: number }) {
      if (state.tab !== undefined) this.adminInterviewSchedule.tab = state.tab
      if (state.page !== undefined) this.adminInterviewSchedule.page = state.page
      if (state.pageSize !== undefined) this.adminInterviewSchedule.pageSize = state.pageSize
      this.saveState()
    },
    resetAll() {
      this.$state = getDefaultState()
      this.saveState()
    },
  },
})
