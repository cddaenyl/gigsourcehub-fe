export interface Sector {
  id: string
  name: string
  is_active: boolean
}

export interface JobRole {
  id: string
  name: string
  sector_id: string
  sector?: Sector
}
