import { Header, PromptSection, EffectSection, AudioSection } from '@/components'

function App(): React.JSX.Element {
  return (
    <div className="min-h-screen flex flex-col bg-[--color-bg-primary]">
      <Header />
      <main className="flex-1 flex flex-col">
        <PromptSection />
        <EffectSection />
        <AudioSection />
      </main>
    </div>
  )
}

export default App
