export function Header(): React.JSX.Element {
  return (
    <header className="h-12 flex items-center justify-between px-4 border-b border-[--color-border] bg-[--color-bg-secondary] flex-shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-[--color-accent-primary] flex items-center justify-center">
          <span className="text-white font-bold text-xs">FX</span>
        </div>
        <h1 className="text-lg font-semibold text-[--color-text-primary]">PromptFX</h1>
        <span className="text-xs text-[--color-text-muted] hidden sm:inline">Studio</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-[--color-text-muted] hidden md:inline">
          AI-Powered Audio Effects
        </span>
      </div>
    </header>
  )
}
