<script setup lang="ts">
import { h } from 'vue'
import type { Component } from 'vue'
import type { MenuOption } from 'naive-ui'
import { User, Layout2, LayoutBoard, Database, Settings, Activity } from '@vicons/tabler'
import MainSidebar from './shared/MainSidebar.vue'

function renderIcon(icon: Component) {
  return () => h(icon)
}

const menuOptions: MenuOption[] = [
  {
    label: 'Dashboard',
    key: 'dashboard',
    icon: renderIcon(Layout2),
  },
  {
    label: 'Audit Log',
    key: 'audit-log',
    icon: renderIcon(Activity),
  },
  {
    label: 'Manejemen User',
    key: 'user-management',
    icon: renderIcon(User),
  },
  {
    label: 'Master Data',
    key: 'master-data',
    icon: renderIcon(Database),
    children: [
      {
        label: 'Bidang',
        key: 'bidang',
      },
      {
        label: 'Posisi',
        key: 'posisi',
      },
      {
        label: 'Status Rekrutmen',
        key: 'status-rekrutmen',
      },
    ],
  },
  {
    label: 'CMS',
    key: 'cms',
    icon: renderIcon(LayoutBoard),
  },
  {
    label: 'System Settings',
    key: 'system-settings',
    icon: renderIcon(Settings),
  },
]
</script>

<template>
  <MainSidebar :menu-options="menuOptions" base-path="/superadmin" />
</template>
