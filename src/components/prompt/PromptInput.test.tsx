import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'

// Mock the API client
vi.mock('@/services/api', () => {
  const mockGetRandomPrompt = vi.fn()
  return {
    api: {
      getRandomPrompt: mockGetRandomPrompt,
    },
  }
})

// Mock the effect store
vi.mock('@/stores/effectStore', () => {
  const mockGenerateEffect = vi.fn()
  let mockIsGenerating = false
  let mockGenerationError: string | null = null

  return {
    useEffectStore: vi.fn(() => ({
      isGenerating: mockIsGenerating,
      generationError: mockGenerationError,
      generateEffect: mockGenerateEffect,
    })),
    // Export mocks for test access
    __mockIsGenerating: () => mockIsGenerating,
    __setMockIsGenerating: (value: boolean) => {
      mockIsGenerating = value
    },
    __mockGenerationError: () => mockGenerationError,
    __setMockGenerationError: (value: string | null) => {
      mockGenerationError = value
    },
  }
})

// Mock toast
vi.mock('@/components/ui', () => {
  const mockToastSuccess = vi.fn()
  const mockToastError = vi.fn()
  return {
    toast: {
      success: mockToastSuccess,
      error: mockToastError,
    },
    __mockToastSuccess: mockToastSuccess,
    __mockToastError: mockToastError,
  }
})

import { PromptInput } from './PromptInput'
import { api } from '@/services/api'
import { toast } from '@/components/ui'

// Get mocked functions
const mockGetRandomPrompt = vi.mocked(api.getRandomPrompt)
const mockToastSuccess = vi.mocked(toast.success)
const mockToastError = vi.mocked(toast.error)

describe('PromptInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render random effect button', () => {
    render(<PromptInput />)
    const randomButton = screen.getByRole('button', { name: /random effect/i })
    expect(randomButton).toBeInTheDocument()
  })

  it('should trigger getRandomPrompt on button click', async () => {
    mockGetRandomPrompt.mockResolvedValue({
      success: true,
      data: { prompt: 'Test random prompt' },
    })

    render(<PromptInput />)
    const randomButton = screen.getByRole('button', { name: /random effect/i })

    fireEvent.click(randomButton)

    await waitFor(() => {
      expect(mockGetRandomPrompt).toHaveBeenCalledTimes(1)
    })
  })

  it('should show loading state during API call', async () => {
    let resolvePromise: (value: unknown) => void
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })

    mockGetRandomPrompt.mockReturnValue(pendingPromise)

    render(<PromptInput />)
    const randomButton = screen.getByRole('button', { name: /random effect/i })

    fireEvent.click(randomButton)

    // Check for loading text
    await waitFor(() => {
      expect(screen.getByText(/thinking/i)).toBeInTheDocument()
    })
    expect(randomButton).toBeDisabled()

    // Resolve the promise
    resolvePromise!({
      success: true,
      data: { prompt: 'Test prompt' },
    })

    await waitFor(() => {
      expect(screen.queryByText(/thinking/i)).not.toBeInTheDocument()
    })
  })

  it('should set prompt in input field on success', async () => {
    const testPrompt = 'Tape echo with wow and flutter'
    mockGetRandomPrompt.mockResolvedValue({
      success: true,
      data: { prompt: testPrompt },
    })

    render(<PromptInput />)
    const randomButton = screen.getByRole('button', { name: /random effect/i })
    const textarea = screen.getByLabelText(/describe your effect/i)

    fireEvent.click(randomButton)

    await waitFor(() => {
      expect(textarea).toHaveValue(testPrompt)
    })
  })

  it('should show success toast on successful prompt generation', async () => {
    mockGetRandomPrompt.mockResolvedValue({
      success: true,
      data: { prompt: 'Test prompt' },
    })

    render(<PromptInput />)
    const randomButton = screen.getByRole('button', { name: /random effect/i })

    fireEvent.click(randomButton)

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Random effect idea generated!')
    })
  })

  it('should show error toast on API error response', async () => {
    mockGetRandomPrompt.mockResolvedValue({
      success: false,
      error: {
        code: 'API_ERROR',
        message: 'Failed to generate prompt',
      },
    })

    render(<PromptInput />)
    const randomButton = screen.getByRole('button', { name: /random effect/i })

    fireEvent.click(randomButton)

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Failed to generate prompt')
    })
  })

  it('should show error toast on exception', async () => {
    mockGetRandomPrompt.mockRejectedValue(new Error('Network error'))

    render(<PromptInput />)
    const randomButton = screen.getByRole('button', { name: /random effect/i })

    fireEvent.click(randomButton)

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Failed to generate random prompt')
    })
  })

  it('should disable button during loading', async () => {
    let resolvePromise: (value: unknown) => void
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })

    mockGetRandomPrompt.mockReturnValue(pendingPromise)

    render(<PromptInput />)
    const randomButton = screen.getByRole('button', { name: /random effect/i })

    fireEvent.click(randomButton)

    await waitFor(() => {
      expect(randomButton).toBeDisabled()
    })

    resolvePromise!({
      success: true,
      data: { prompt: 'Test' },
    })

    await waitFor(() => {
      expect(randomButton).not.toBeDisabled()
    })
  })

  it('should handle empty prompt in response', async () => {
    mockGetRandomPrompt.mockResolvedValue({
      success: true,
      data: { prompt: '' },
    })

    render(<PromptInput />)
    const randomButton = screen.getByRole('button', { name: /random effect/i })
    const textarea = screen.getByLabelText(/describe your effect/i)

    fireEvent.click(randomButton)

    await waitFor(() => {
      expect(textarea).toHaveValue('')
      expect(mockToastSuccess).toHaveBeenCalled()
    })
  })

  it('should not allow multiple simultaneous random prompt requests', async () => {
    let resolvePromise: (value: unknown) => void
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })

    mockGetRandomPrompt.mockReturnValue(pendingPromise)

    render(<PromptInput />)
    const randomButton = screen.getByRole('button', { name: /random effect/i })

    // Click multiple times
    fireEvent.click(randomButton)
    fireEvent.click(randomButton)
    fireEvent.click(randomButton)

    // Should only be called once because button is disabled after first click
    await waitFor(() => {
      expect(mockGetRandomPrompt).toHaveBeenCalledTimes(1)
    })

    resolvePromise!({
      success: true,
      data: { prompt: 'Test' },
    })

    await waitFor(() => {
      expect(randomButton).not.toBeDisabled()
    })
  })
})
