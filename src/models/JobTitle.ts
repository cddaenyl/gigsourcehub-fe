import type { Sector } from './Sector'

export interface JobTitle {
  id: string
  name: string
  sector_id: string
  sector?: Sector
}
