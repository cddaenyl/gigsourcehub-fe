<script setup lang="ts">
import { Layout2, LayoutBoard, Note, Users } from '@vicons/tabler'
import type { MenuOption } from 'naive-ui'
import type { Component } from 'vue'
import { h } from 'vue'
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
    children: [
      {
        label: 'Lowongan',
        key: 'lowongan',
      },
      {
        label: 'Landing Page',
        key: 'landing-page',
      },
    ],
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
