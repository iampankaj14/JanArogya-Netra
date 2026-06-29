export class AppError extends Error {
  public code: string;
  public fatal: boolean;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', fatal: boolean = false) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.fatal = fatal;

    // Restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
