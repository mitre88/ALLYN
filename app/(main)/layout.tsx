import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { GlobalAudioPlayer } from "@/components/content/global-audio-player"

export default function MainLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0">
        <div className="shell-grid absolute inset-0 opacity-60" />
        <div className="grain-overlay absolute inset-0" />
        <div className="absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.18)_0%,transparent_66%)] blur-3xl" />
        <div className="absolute -left-24 top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.14)_0%,transparent_72%)] blur-3xl" />
        <div className="absolute right-0 top-[18rem] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,hsl(var(--foreground)/0.09)_0%,transparent_72%)] blur-3xl" />
      </div>
      <Header />
      <main id="main-content" className="relative z-10 pt-20 md:pt-24">
        {children}
      </main>
      <Footer />
      <GlobalAudioPlayer />
      {modal}
    </div>
  )
}
