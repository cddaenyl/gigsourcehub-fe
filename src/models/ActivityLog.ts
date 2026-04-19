export interface ActivityLogActor {
  id: string
  name: string
  email: string
  system_role_name: string
}

export interface ActivityLog {
  id: string
  actor_id: string
  actor_name: string
  actor_role: string
  action_type: string
  module: string
  description: string
  metadata: string | null
  ip_address: string | null
  is_success: boolean
  created_at: string
}
