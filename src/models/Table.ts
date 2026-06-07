export interface AllCandidates {
  id: string
  candidate_id?: string
  no: number
  nama: string
  bidang: string
  appliedRole: string[]
  level: string
  status: string
  statusHexCode: string | null
  recruitmentStatusId?: string | null
  unavailableUntil?: string | null
  jobRoleName?: string | null
  projectName?: string | null
  contractStart?: string | null
  contractEnd?: string | null
  is_bookmark?: boolean
}

export interface TalentNeed {
  id: string
  requestId?: string
  employeeUserId?: string | null
  no: number
  projectKegiatan: string
  jumlahSdm: number
  tanggalPengajuan: string
  batasWaktu: string
  picHr: string
  status: string
  urgensi: 'High' | 'Middle' | 'Low'
}
