export interface AllCandidates {
  id: string
  no: number
  nama: string
  bidang: string
  appliedRole: string[]
  level: string
  status: string
  statusHexCode: string | null
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
