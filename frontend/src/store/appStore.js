import { create } from 'zustand'

const useAppStore = create((set) => ({
  messages: [],
  sources: [],
  documents: [],
  isStreaming: false,
  isUploading: false,
  activePage: 'chat', // 'chat' | 'docs' | 'search'

  setActivePage: (page) => set({ activePage: page }),

  addUserMessage: (content) =>
    set((state) => ({ messages: [...state.messages, { role: 'user', content }] })),

  startAiMessage: () =>
    set((state) => ({
      messages: [...state.messages, { role: 'ai', content: '' }],
      isStreaming: true,
      sources: [],
    })),

  appendToken: (token) =>
    set((state) => {
      const messages = [...state.messages]
      const last = messages[messages.length - 1]
      if (last?.role === 'ai') {
        messages[messages.length - 1] = { ...last, content: last.content + token }
      }
      return { messages }
    }),

  stopStreaming: () => set({ isStreaming: false }),
  setSources: (sources) => set({ sources }),
  setDocuments: (documents) => set({ documents }),
  setUploading: (val) => set({ isUploading: val }),
  clearChat: () => set({ messages: [], sources: [] }),
}))

export default useAppStore
