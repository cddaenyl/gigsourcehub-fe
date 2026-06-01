import type { Sector } from './Sector'

export interface JobTitle {
  id: string
  name: string
  sector_id: string
  is_active: boolean
  sector?: Sector
}
