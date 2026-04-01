/**
 * Custom application error class for handling operational errors.
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public status: string;

  /**
   * Constructs an AppError
   * @param message - The error message
   * @param statusCode - HTTP status code
   * @param isOperational - Identifies if the error is an operational, expected error
   */
  constructor(message: string, statusCode: number, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}
