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

    // V8 helper; not on lib ES typings — avoid TS2339 on ErrorConstructor (e.g. Render CI).
    const Err = Error as unknown as { captureStackTrace?: (t: object, ctor?: unknown) => void };
    if (typeof Err.captureStackTrace === 'function') {
      Err.captureStackTrace(this, this.constructor);
    }
  }
}
