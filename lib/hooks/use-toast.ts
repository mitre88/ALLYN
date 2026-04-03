import { sileo } from "sileo"

export function useToast() {
  const showSuccess = (message: string, description?: string) => {
    sileo.success({ title: message, description })
  }

  const showError = (message: string, description?: string) => {
    sileo.error({ title: message, description })
  }

  const showInfo = (message: string, description?: string) => {
    sileo.info({ title: message, description })
  }

  const showWarning = (message: string, description?: string) => {
    sileo.warning({ title: message, description })
  }

  const showLoading = (message: string) => {
    sileo.info({ title: message })
  }

  return {
    toast: sileo,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showLoading,
  }
}
