import { useState, useRef, useCallback } from 'react'
import { usePresets, type Preset } from '@/hooks/usePresets'
import { useEffectStore } from '@/stores/effectStore'
import { toast } from '@/components/ui'

export function PresetControls(): React.JSX.Element {
  const { definition, parameterValues, setDefinition, setParameterValues } = useEffectStore()
  const { presets, savePreset, deletePreset, exportPreset, exportAllPresets, importPresets } =
    usePresets()
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [showPresetList, setShowPresetList] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = useCallback((): void => {
    if (definition === null || presetName.trim() === '') return
    savePreset(presetName.trim(), definition, parameterValues)
    toast.success(`Preset "${presetName.trim()}" saved`)
    setPresetName('')
    setShowSaveDialog(false)
  }, [definition, presetName, parameterValues, savePreset])

  const handleLoad = useCallback(
    (preset: Preset): void => {
      setDefinition(preset.effect)
      setParameterValues(preset.parameterValues)
      setShowPresetList(false)
      toast.success(`Loaded "${preset.name}"`)
    },
    [setDefinition, setParameterValues]
  )

  const handleImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
      const file = e.target.files?.[0]
      if (file === undefined) return

      try {
        const count = await importPresets(file)
        toast.success(`Imported ${String(count)} preset(s)`)
      } catch {
        toast.error('Failed to import presets. Invalid file format.')
      }

      // Reset file input
      if (fileInputRef.current !== null) {
        fileInputRef.current.value = ''
      }
    },
    [importPresets]
  )

  return (
    <div className="flex items-center gap-2">
      {/* Save Button */}
      <button
        type="button"
        onClick={() => {
          setShowSaveDialog(true)
        }}
        disabled={definition === null}
        className="px-3 py-1.5 text-sm btn-mechanical disabled:opacity-50 disabled:cursor-not-allowed text-[--color-text-secondary] rounded transition-all flex items-center gap-1.5"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
          />
        </svg>
        Save
      </button>

      {/* Load Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowPresetList(!showPresetList)
          }}
          className={`px-3 py-1.5 text-sm rounded transition-all flex items-center gap-1.5 ${
            showPresetList
              ? 'btn-mechanical-lit text-[--color-accent-primary]'
              : 'btn-mechanical text-[--color-text-secondary]'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          Load
          {presets.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-[--color-accent-secondary] text-[--color-text-primary] rounded-full">
              {presets.length}
            </span>
          )}
        </button>

        {/* Preset List Dropdown */}
        {showPresetList && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-[--color-bg-panel] border border-[--color-border] rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
            {presets.length === 0 ? (
              <div className="p-3 text-sm text-[--color-text-muted] text-center">
                No saved presets
              </div>
            ) : (
              presets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between p-2 hover:bg-[--color-bg-tertiary] border-b border-[--color-border] last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() => {
                      handleLoad(preset)
                    }}
                    className="flex-1 text-left"
                  >
                    <div className="text-sm text-[--color-text-primary]">{preset.name}</div>
                    <div className="text-xs text-[--color-text-muted]">{preset.effect.name}</div>
                  </button>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        exportPreset(preset.id)
                      }}
                      className="p-1 text-[--color-text-muted] hover:text-[--color-text-primary] transition-colors"
                      title="Export"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deletePreset(preset.id)
                      }}
                      className="p-1 text-[--color-text-muted] hover:text-[--color-error] transition-colors"
                      title="Delete"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
            {presets.length > 0 && (
              <div className="p-2 border-t border-[--color-border]">
                <button
                  type="button"
                  onClick={() => {
                    exportAllPresets()
                  }}
                  className="w-full px-3 py-1.5 text-xs btn-mechanical text-[--color-text-muted] rounded transition-all"
                >
                  Export All Presets
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Import Button */}
      <button
        type="button"
        onClick={() => {
          fileInputRef.current?.click()
        }}
        className="px-3 py-1.5 text-sm btn-mechanical text-[--color-text-secondary] rounded transition-all flex items-center gap-1.5"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        Import
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.promptfx"
        onChange={(e) => {
          void handleImport(e)
        }}
        className="hidden"
      />

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[--color-bg-panel] border border-[--color-border] rounded-xl p-6 w-80 shadow-2xl panel-bevel">
            <h3 className="text-lg font-medium text-[--color-text-primary] mb-4">Save Preset</h3>
            <input
              type="text"
              value={presetName}
              onChange={(e) => {
                setPresetName(e.target.value)
              }}
              placeholder="Preset name..."
              className="w-full px-3 py-2 bg-[--color-bg-tertiary] border border-[--color-border] rounded-lg text-[--color-text-primary] placeholder-[--color-text-muted] focus:outline-none focus:ring-1 focus:ring-[--color-accent-primary] mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave()
                }
              }}
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowSaveDialog(false)
                  setPresetName('')
                }}
                className="px-4 py-2 text-sm text-[--color-text-muted] hover:text-[--color-text-primary] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={presetName.trim() === ''}
                className="px-4 py-2 text-sm btn-mechanical disabled:opacity-50 disabled:cursor-not-allowed text-[--color-text-secondary] rounded transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
