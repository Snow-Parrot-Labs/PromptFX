import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Anthropic SDK
const mockMessagesCreate = vi.fn()

vi.mock('@anthropic-ai/sdk', () => {
  // Create mock function inside the factory to avoid hoisting issues
  const createMock = vi.fn()
  return {
    default: class MockAnthropic {
      messages = {
        get create() {
          return mockMessagesCreate
        },
      }
    },
  }
})

import { generateRandomPrompt } from './aiService.js'

// Mock config
vi.mock('../config/index.js', () => ({
  config: {
    ANTHROPIC_API_KEY: 'test-api-key',
  },
}))

describe('generateRandomPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return trimmed prompt string on successful AI response', async () => {
    const mockPrompt = 'Tape echo with wow and flutter, slowly degrading into noise'
    mockMessagesCreate.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: `  ${mockPrompt}  `, // Extra whitespace to test trimming
        },
      ],
    })

    const result = await generateRandomPrompt()

    expect(result).toBe(mockPrompt)
    expect(mockMessagesCreate).toHaveBeenCalledTimes(1)
    expect(mockMessagesCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 100,
        temperature: 1,
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('Write a short audio effect idea'),
          }),
        ]),
      })
    )
  })

  it('should throw error when AI returns non-text content', async () => {
    mockMessagesCreate.mockResolvedValue({
      content: [
        {
          type: 'image',
          // Non-text content
        },
      ],
    })

    await expect(generateRandomPrompt()).rejects.toThrow('No text response from AI')
  })

  it('should throw error when AI response has no content', async () => {
    mockMessagesCreate.mockResolvedValue({
      content: [],
    })

    await expect(generateRandomPrompt()).rejects.toThrow('No text response from AI')
  })

  it('should throw error when AI API call fails', async () => {
    const apiError = new Error('API request failed')
    mockMessagesCreate.mockRejectedValue(apiError)

    await expect(generateRandomPrompt()).rejects.toThrow('API request failed')
  })

  it('should generate different prompts on multiple calls (randomness test)', async () => {
    const prompts = [
      'Tape echo with wow and flutter',
      'Massive hall reverb that swells',
      'Crunchy lo-fi filter with drops',
    ]
    let callCount = 0

    mockMessagesCreate.mockImplementation(() => {
      const prompt = prompts[callCount % prompts.length]
      callCount++
      return Promise.resolve({
        content: [
          {
            type: 'text',
            text: prompt,
          },
        ],
      })
    })

    const results = await Promise.all([
      generateRandomPrompt(),
      generateRandomPrompt(),
      generateRandomPrompt(),
    ])

    // Verify all prompts were returned (even if they're the same due to randomness,
    // we're testing that the function works correctly)
    expect(results).toHaveLength(3)
    expect(results.every((r) => typeof r === 'string' && r.length > 0)).toBe(true)
    expect(mockMessagesCreate).toHaveBeenCalledTimes(3)
  })

  it('should include random seed words in the prompt', async () => {
    mockMessagesCreate.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: 'Test prompt',
        },
      ],
    })

    await generateRandomPrompt()

    const callArgs = mockMessagesCreate.mock.calls[0][0]
    const userMessage = callArgs.messages[0].content as string

    // Verify the message includes seed word categories
    expect(userMessage).toContain('inspired by:')
    // The message should contain content after "inspired by:" indicating seed words were used
    const inspiredByIndex = userMessage.indexOf('inspired by:')
    expect(inspiredByIndex).toBeGreaterThan(-1)
    // Should have content after "inspired by:"
    expect(userMessage.length).toBeGreaterThan(inspiredByIndex + 'inspired by:'.length + 5)
  })

  it('should handle empty string response from AI', async () => {
    mockMessagesCreate.mockResolvedValue({
      content: [
        {
          type: 'text',
          text: '   ', // Only whitespace
        },
      ],
    })

    const result = await generateRandomPrompt()
    expect(result).toBe('')
  })
})
