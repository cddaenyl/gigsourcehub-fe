export interface User {
  id: string
  name: string
  email: string
  pendidikan_terakhir: string | null
  instansi_pendidikan: string | null
  jurusan: string | null
  ipk: string | null
  kabupaten_id: string | null
  provinsi_id: string | null
  lama_pengalaman_kerja: number | null
  bidang_minat: string | null
  applied_role: string | null
  skills: string | null
  link_portofolio: string | null
  created_at: string
  updated_at: string
}
export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  status: number
  message: string
  validation: string | null
  data: {
    token: string
    user: User
  }
}
