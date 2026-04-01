<script setup lang="ts">
import { h } from 'vue'
import type { Component } from 'vue'
import type { MenuOption } from 'naive-ui'
import { Users, Layout2, LayoutBoard, Note } from '@vicons/tabler'
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
    label: 'Kandidat',
    key: 'kandidat',
    icon: renderIcon(Users),
    children: [
      {
        label: 'Daftar Kandidat',
        key: 'daftar-kandidat',
      },
      {
        label: 'Jadwal Interview',
        key: 'interview-schedule',
      },
      {
        label: 'Chat',
        key: 'candidate-chat',
      },
    ],
  },
  {
    label: 'CMS',
    key: 'cms',
    icon: renderIcon(LayoutBoard),
  },
  {
    label: 'Kebutuhan Talenta',
    key: 'talent-needs',
    icon: renderIcon(Note),
  },
]
</script>

<template>
  <MainSidebar :menu-options="menuOptions" base-path="/admin" />
</template>
