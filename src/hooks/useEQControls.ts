import { useEffect } from 'react'
import { useEQStore } from '@/stores/eqStore'
import { audioEngine } from '@/services/audioEngine'

export function useEQControls(): void {
  const { inputEQ, outputEQ } = useEQStore()

  // Initialize EQ on mount
  useEffect(() => {
    audioEngine.initializeEQ()

    return () => {
      audioEngine.destroyEQ()
    }
  }, [])

  // Sync input EQ bypass state
  useEffect(() => {
    audioEngine.setInputEQBypass(inputEQ.bypassed)
  }, [inputEQ.bypassed])

  // Sync output EQ bypass state
  useEffect(() => {
    audioEngine.setOutputEQBypass(outputEQ.bypassed)
  }, [outputEQ.bypassed])

  // Sync input EQ highpass parameters
  useEffect(() => {
    audioEngine.updateInputEQParameter('highpass', 'frequency', inputEQ.highpass.frequency)
  }, [inputEQ.highpass.frequency])

  useEffect(() => {
    audioEngine.updateInputEQParameter('highpass', 'Q', inputEQ.highpass.Q)
  }, [inputEQ.highpass.Q])

  // Sync input EQ lowShelf parameters
  useEffect(() => {
    audioEngine.updateInputEQParameter('lowShelf', 'frequency', inputEQ.lowShelf.frequency)
  }, [inputEQ.lowShelf.frequency])

  useEffect(() => {
    audioEngine.updateInputEQParameter('lowShelf', 'gain', inputEQ.lowShelf.gain)
  }, [inputEQ.lowShelf.gain])

  useEffect(() => {
    audioEngine.updateInputEQParameter('lowShelf', 'Q', inputEQ.lowShelf.Q)
  }, [inputEQ.lowShelf.Q])

  // Sync input EQ midPeak parameters
  useEffect(() => {
    audioEngine.updateInputEQParameter('midPeak', 'frequency', inputEQ.midPeak.frequency)
  }, [inputEQ.midPeak.frequency])

  useEffect(() => {
    audioEngine.updateInputEQParameter('midPeak', 'gain', inputEQ.midPeak.gain)
  }, [inputEQ.midPeak.gain])

  useEffect(() => {
    audioEngine.updateInputEQParameter('midPeak', 'Q', inputEQ.midPeak.Q)
  }, [inputEQ.midPeak.Q])

  // Sync input EQ highPeak parameters
  useEffect(() => {
    audioEngine.updateInputEQParameter('highPeak', 'frequency', inputEQ.highPeak.frequency)
  }, [inputEQ.highPeak.frequency])

  useEffect(() => {
    audioEngine.updateInputEQParameter('highPeak', 'gain', inputEQ.highPeak.gain)
  }, [inputEQ.highPeak.gain])

  useEffect(() => {
    audioEngine.updateInputEQParameter('highPeak', 'Q', inputEQ.highPeak.Q)
  }, [inputEQ.highPeak.Q])

  // Sync input EQ lowpass parameters
  useEffect(() => {
    audioEngine.updateInputEQParameter('lowpass', 'frequency', inputEQ.lowpass.frequency)
  }, [inputEQ.lowpass.frequency])

  useEffect(() => {
    audioEngine.updateInputEQParameter('lowpass', 'Q', inputEQ.lowpass.Q)
  }, [inputEQ.lowpass.Q])

  // Sync output EQ highpass parameters
  useEffect(() => {
    audioEngine.updateOutputEQParameter('highpass', 'frequency', outputEQ.highpass.frequency)
  }, [outputEQ.highpass.frequency])

  useEffect(() => {
    audioEngine.updateOutputEQParameter('highpass', 'Q', outputEQ.highpass.Q)
  }, [outputEQ.highpass.Q])

  // Sync output EQ lowShelf parameters
  useEffect(() => {
    audioEngine.updateOutputEQParameter('lowShelf', 'frequency', outputEQ.lowShelf.frequency)
  }, [outputEQ.lowShelf.frequency])

  useEffect(() => {
    audioEngine.updateOutputEQParameter('lowShelf', 'gain', outputEQ.lowShelf.gain)
  }, [outputEQ.lowShelf.gain])

  useEffect(() => {
    audioEngine.updateOutputEQParameter('lowShelf', 'Q', outputEQ.lowShelf.Q)
  }, [outputEQ.lowShelf.Q])

  // Sync output EQ midPeak parameters
  useEffect(() => {
    audioEngine.updateOutputEQParameter('midPeak', 'frequency', outputEQ.midPeak.frequency)
  }, [outputEQ.midPeak.frequency])

  useEffect(() => {
    audioEngine.updateOutputEQParameter('midPeak', 'gain', outputEQ.midPeak.gain)
  }, [outputEQ.midPeak.gain])

  useEffect(() => {
    audioEngine.updateOutputEQParameter('midPeak', 'Q', outputEQ.midPeak.Q)
  }, [outputEQ.midPeak.Q])

  // Sync output EQ highPeak parameters
  useEffect(() => {
    audioEngine.updateOutputEQParameter('highPeak', 'frequency', outputEQ.highPeak.frequency)
  }, [outputEQ.highPeak.frequency])

  useEffect(() => {
    audioEngine.updateOutputEQParameter('highPeak', 'gain', outputEQ.highPeak.gain)
  }, [outputEQ.highPeak.gain])

  useEffect(() => {
    audioEngine.updateOutputEQParameter('highPeak', 'Q', outputEQ.highPeak.Q)
  }, [outputEQ.highPeak.Q])

  // Sync output EQ lowpass parameters
  useEffect(() => {
    audioEngine.updateOutputEQParameter('lowpass', 'frequency', outputEQ.lowpass.frequency)
  }, [outputEQ.lowpass.frequency])

  useEffect(() => {
    audioEngine.updateOutputEQParameter('lowpass', 'Q', outputEQ.lowpass.Q)
  }, [outputEQ.lowpass.Q])
}
