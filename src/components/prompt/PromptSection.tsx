import { PromptInput } from './PromptInput'

export function PromptSection(): React.JSX.Element {
  return (
    <section className="p-6 border-b border-[--color-border]">
      <div className="max-w-3xl mx-auto">
        <PromptInput />
      </div>
    </section>
  )
}
