import type { Request, Response, NextFunction } from 'express'

export interface AppError extends Error {
  statusCode?: number
  code?: string
  suggestion?: string
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500
  const code = err.code ?? 'INTERNAL_ERROR'

  console.error(`[ERROR] ${code}:`, err.message)

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: err.message,
      ...(err.suggestion && { suggestion: err.suggestion }),
    },
  })
}

export function createError(
  message: string,
  statusCode: number,
  code: string,
  suggestion?: string
): AppError {
  const error = new Error(message) as AppError
  error.statusCode = statusCode
  error.code = code
  error.suggestion = suggestion
  return error
}
