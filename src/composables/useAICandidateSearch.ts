import { ref } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { searchCandidatesApi } from '@/services/search.service'
import type { ChatMessage, AISearchParsedContent } from '@/models/CandidateSearch'

export function useAICandidateSearch() {
  const chatHistory = ref<ChatMessage[]>([])
  
  const aiSearchMutation = useMutation({
    mutationFn: (query: string) => searchCandidatesApi(query),
    onSuccess: (data) => {
      if (data.data && data.data.length > 0) {
        const item = data.data[0]
        if (!item) return
        try {
          const parsedContent: AISearchParsedContent = JSON.parse(item.content)
          const fullText = parsedContent.summary
          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace('.', ':')
          const aiMsgId = `ai-${Date.now()}`

          // 1. Add an empty placeholder AI message with typing flag
          chatHistory.value.push({
            id: aiMsgId,
            role: 'ai',
            text: '',
            parsedContent: parsedContent,
            displayParsedContent: true, // Show candidates immediately
            timestamp: timestamp,
            isTyping: true
          })

          const aiMsgIndex = chatHistory.value.findIndex(m => m.id === aiMsgId)
          if (aiMsgIndex === -1) return
          const targetMsg = chatHistory.value[aiMsgIndex]
          if (!targetMsg) return

          // 2. Simulate typing animation
          let charIndex = 0
          const typingSpeed = 10 // ms per character (slower)
          
          const typeNextChar = () => {
            if (charIndex < fullText.length) {
              targetMsg.text += fullText.charAt(charIndex)
              charIndex++
              setTimeout(typeNextChar, typingSpeed)
            } else {
              // Typing finished
              targetMsg.isTyping = false
            }
          }

          typeNextChar()

        } catch (error) {
          console.error("Failed to parse AI response content", error)
          chatHistory.value.push({
             id: `ai-${Date.now()}`,
             role: 'ai',
             text: "Maaf, terjadi kesalahan saat membaca data dari AI.",
             timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace('.', ':')
          })
        }
      }
    },
    onError: () => {
      chatHistory.value.push({
         id: `ai-${Date.now()}`,
         role: 'ai',
         text: "Maaf, saya tidak dapat memproses permintaan Anda saat ini.",
         timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace('.', ':')
      })
    }
  })

  const sendMessage = (query: string) => {
    if (!query.trim()) return

    // Push User Query
    chatHistory.value.push({
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace('.', ':')
    })

    // Trigger AI Mutaton
    aiSearchMutation.mutate(query)
  }

  const clearHistory = () => {
    chatHistory.value = []
  }

  return {
    chatHistory,
    sendMessage,
    clearHistory,
    isLoading: aiSearchMutation.isPending,
    error: aiSearchMutation.error
  }
}
