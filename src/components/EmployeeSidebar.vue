<script setup lang="ts">
import { h } from 'vue'
import type { Component } from 'vue'
import type { MenuOption } from 'naive-ui'
import { Users, Note, Circles } from '@vicons/tabler'
import MainSidebar from './shared/MainSidebar.vue'

function renderIcon(icon: Component) {
  return () => h(icon)
}

const menuOptions: MenuOption[] = [
  {
    label: 'Kebutuhan Talenta',
    key: 'talent-needs',
    icon: renderIcon(Note),
  },
  {
    label: 'Daftar Kandidat',
    key: 'candidate-list',
    icon: renderIcon(Users),
  },
  {
    label: 'Tim Saya',
    key: 'my-team',
    icon: renderIcon(Circles),
  },
]
</script>

<template>
  <MainSidebar :menu-options="menuOptions" base-path="/employee" />
</template>
