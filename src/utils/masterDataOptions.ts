/**
 * Builds NaiveUI-compatible dropdown options for master data items.
 * - Active items are sorted alphabetically and shown first.
 * - Inactive items are sorted alphabetically, disabled, and grouped under a divider at the end.
 */
export function buildMasterDataOptions<T extends { id: string; name: string; is_active: boolean }>(
  items: T[]
): any[] {
  const active = items
    .filter((i) => i.is_active)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((i) => ({ label: i.name, value: i.id, disabled: false }))

  const inactive = items
    .filter((i) => !i.is_active)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((i) => ({ label: i.name, value: i.id, disabled: true }))

  if (inactive.length === 0) {
    return active
  }

  return [
    ...active,
    { type: 'divider', key: '__divider__' },
    { type: 'group', label: 'Tidak Aktif', key: '__inactive_group__', children: inactive },
  ]
}
