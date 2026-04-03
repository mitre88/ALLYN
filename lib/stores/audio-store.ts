import { create } from "zustand"

export interface AudioTrack {
  contentId: string
  title: string
  author: string | null
  thumbnailUrl: string | null
  audioUrl: string
  categoryColor?: string
}

interface AudioState {
  track: AudioTrack | null
  isPlaying: boolean
  isLoading: boolean
  progress: number       // 0-100
  duration: number       // seconds
  currentTime: number    // seconds
  error: string | null

  // Actions
  play: (track: AudioTrack) => void
  resume: () => void
  pause: () => void
  stop: () => void
  setProgress: (progress: number, currentTime: number, duration: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  seekTo: (time: number) => void
}

// Singleton audio element shared across the app
let audioElement: HTMLAudioElement | null = null

function getAudioElement(): HTMLAudioElement {
  if (typeof window === "undefined") throw new Error("Audio not available on server")
  if (!audioElement) {
    audioElement = new Audio()
    audioElement.preload = "auto"
  }
  return audioElement
}

export const useAudioStore = create<AudioState>((set, get) => ({
  track: null,
  isPlaying: false,
  isLoading: false,
  progress: 0,
  duration: 0,
  currentTime: 0,
  error: null,

  play: (track) => {
    const audio = getAudioElement()
    const currentTrack = get().track

    // If same track, just resume
    if (currentTrack?.contentId === track.contentId && audio.src) {
      audio.play()
      set({ isPlaying: true, error: null })
      return
    }

    // New track
    set({ track, isLoading: true, isPlaying: false, progress: 0, currentTime: 0, duration: 0, error: null })

    audio.src = track.audioUrl
    audio.load()

    audio.onloadedmetadata = () => {
      set({ duration: audio.duration, isLoading: false })
    }

    audio.oncanplay = () => {
      audio.play()
      set({ isPlaying: true, isLoading: false })
    }

    audio.ontimeupdate = () => {
      const dur = audio.duration || 1
      set({
        currentTime: audio.currentTime,
        progress: (audio.currentTime / dur) * 100,
      })
    }

    audio.onended = () => {
      set({ isPlaying: false, progress: 100 })
    }

    audio.onerror = () => {
      set({ isLoading: false, isPlaying: false, error: "Error al cargar el audio" })
    }
  },

  resume: () => {
    const audio = getAudioElement()
    audio.play()
    set({ isPlaying: true })
  },

  pause: () => {
    const audio = getAudioElement()
    audio.pause()
    set({ isPlaying: false })
  },

  stop: () => {
    const audio = getAudioElement()
    audio.pause()
    audio.currentTime = 0
    audio.src = ""
    set({ track: null, isPlaying: false, progress: 0, currentTime: 0, duration: 0, error: null })
  },

  setProgress: (progress, currentTime, duration) => {
    set({ progress, currentTime, duration })
  },

  setLoading: (loading) => {
    set({ isLoading: loading })
  },

  setError: (error) => {
    set({ error, isLoading: false, isPlaying: false })
  },

  seekTo: (time) => {
    const audio = getAudioElement()
    audio.currentTime = time
    set({ currentTime: time })
  },
}))
