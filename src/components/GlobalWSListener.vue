<script setup lang="ts">
import { watch } from 'vue'
import { useMessage } from 'naive-ui'
import { useQueryClient } from '@tanstack/vue-query'
import { useChatWebSocket } from '@/composables/useChatWebSocket'

const message = useMessage()
const queryClient = useQueryClient()
const { incomingNotification, incomingMessage } = useChatWebSocket()

const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    
    const runSound = () => {
      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, startTime)
        
        gain.gain.setValueAtTime(0, startTime)
        gain.gain.linearRampToValueAtTime(0.25, startTime + 0.04)
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
        
        osc.connect(gain)
        gain.connect(ctx.destination)
        
        osc.start(startTime)
        osc.stop(startTime + duration)
      }

      const now = ctx.currentTime
      // Ascending chime: C5 (523.25 Hz) then G5 (783.99 Hz)
      playTone(523.25, now, 0.35)
      playTone(783.99, now + 0.08, 0.45)
    }

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        runSound()
      }).catch(err => {
        console.warn('AudioContext failed to resume:', err)
      })
    } else {
      runSound()
    }
  } catch (e) {
    console.error('Web Audio API play error:', e)
  }
}

watch(incomingNotification, (notif) => {
  if (!notif) return

  // Play ascending notification chime
  playNotificationSound()

  // Display Naive UI message toast
  message.info(`${notif.title}: ${notif.description || ''}`, {
    duration: 6000,
    keepAliveOnHover: true,
  })

  // Refresh cache for notification counts and lists
  queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] })
  queryClient.invalidateQueries({ queryKey: ['notifications'] })

  // Reset the ref state to allow triggering identical messages again
  incomingNotification.value = null
})

watch(incomingMessage, (msg) => {
  if (!msg) return
  
  // Play the soft chime for chat messages as well
  playNotificationSound()

  // Invalidate conversation list cache
  queryClient.invalidateQueries({ queryKey: ['conversations'] })
})
</script>

<template>
  <!-- Headless utility component -->
  <div style="display: none;"></div>
</template>
