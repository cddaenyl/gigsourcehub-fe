import { createApp } from 'vue'
import { createPinia } from "pinia"
import { VueQueryPlugin } from "@tanstack/vue-query"
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import axios from 'axios'

// Configure axios baseURL
axios.defaults.baseURL = import.meta.env.VITE_BASE_API_URL

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

const app = createApp(App)
app.use(createPinia())
app.use(VueQueryPlugin)
app.use(router)

app.mount('#app')
