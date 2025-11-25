import { create } from 'zustand'

type Panel = 'prompt' | 'effect' | 'audio'

interface UIState {
  // Loading states
  isAppLoading: boolean
  isFileUploading: boolean
  uploadProgress: number

  // Error states
  globalError: string | null

  // UI preferences
  activePanel: Panel
  showAdvancedControls: boolean

  // Actions
  setIsAppLoading: (loading: boolean) => void
  setIsFileUploading: (uploading: boolean) => void
  setUploadProgress: (progress: number) => void
  setGlobalError: (error: string | null) => void
  setActivePanel: (panel: Panel) => void
  setShowAdvancedControls: (show: boolean) => void
  clearError: () => void
  reset: () => void
}

const initialState = {
  isAppLoading: false,
  isFileUploading: false,
  uploadProgress: 0,
  globalError: null,
  activePanel: 'prompt' as Panel,
  showAdvancedControls: false,
}

export const useUIStore = create<UIState>((set) => ({
  ...initialState,

  setIsAppLoading: (isAppLoading) => {
    set({ isAppLoading })
  },
  setIsFileUploading: (isFileUploading) => {
    set({ isFileUploading })
  },
  setUploadProgress: (uploadProgress) => {
    set({ uploadProgress })
  },
  setGlobalError: (globalError) => {
    set({ globalError })
  },
  setActivePanel: (activePanel) => {
    set({ activePanel })
  },
  setShowAdvancedControls: (showAdvancedControls) => {
    set({ showAdvancedControls })
  },
  clearError: () => {
    set({ globalError: null })
  },
  reset: () => {
    set(initialState)
  },
}))
