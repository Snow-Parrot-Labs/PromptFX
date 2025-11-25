import { Header } from '@/components'
import { LeftPanel, CenterRack, RightPanel } from '@/components/layout'
import { ToastContainer } from '@/components/ui'

function App(): React.JSX.Element {
  return (
    <div className="h-screen flex flex-col bg-[--color-bg-primary] overflow-hidden">
      <Header />
      <main className="flex-1 flex overflow-hidden">
        <LeftPanel />
        <CenterRack />
        <RightPanel />
      </main>
      <ToastContainer />
    </div>
  )
}

export default App
