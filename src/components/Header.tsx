export function Header(): React.JSX.Element {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-[--color-border] bg-[--color-bg-secondary]">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[--color-accent-primary] flex items-center justify-center">
          <span className="text-white font-bold text-sm">FX</span>
        </div>
        <h1 className="text-xl font-semibold text-[--color-text-primary]">PromptFX</h1>
      </div>
      <nav className="flex items-center gap-4">
        <span className="text-sm text-[--color-text-muted]">AI-Powered Audio Effects</span>
      </nav>
    </header>
  )
}
