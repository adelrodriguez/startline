class CustomError extends Error {
  constructor(name: string, message: string, cause?: unknown) {
    super(message)
    this.name = name
    if (cause) this.cause = cause
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class AssertionError extends CustomError {
  constructor(message: string, cause?: unknown) {
    super("AssertionError", message, cause)
  }
}

export class AuthError extends CustomError {
  constructor(message: string, cause?: unknown) {
    super("AuthError", message, cause)
  }
}

export class ContextError extends CustomError {
  constructor(message: string, cause?: unknown) {
    super("ContextError", message, cause)
  }
}

export class DatabaseError extends CustomError {
  constructor(message: string, cause?: unknown) {
    super("DatabaseError", message, cause)
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string, cause?: unknown) {
    super("NotFoundError", message, cause)
  }
}

export class ValidationError extends CustomError {
  constructor(message: string, cause?: unknown) {
    super("ValidationError", message, cause)
  }
}

export class QueryError extends CustomError {
  constructor(queryName: string, cause?: unknown) {
    super("QueryError", `Invalid query params provided for ${queryName}`, cause)
  }
}

export class SendEmailError extends CustomError {
  constructor(
    { email, name, message }: { email: string; name: string; message: string },
    cause?: unknown
  ) {
    super(
      "SendEmailError",
      `Error sending email to ${email}. ${name}: ${message}`,
      cause
    )
  }
}

export class PasswordResetError extends CustomError {
  constructor(message: string, cause?: unknown) {
    super("PasswordResetError", message, cause)
  }
}

export class OrganizationError extends CustomError {
  constructor(message: string, cause?: unknown) {
    super("OrganizationError", message, cause)
  }
}

export class OrganizationInvitationError extends CustomError {
  constructor(message: string, cause?: unknown) {
    super("OrganizationInvitationError", message, cause)
  }
}

export class InternalError extends CustomError {
  constructor(message: string, cause?: unknown) {
    super("InternalError", message, cause)
  }
}

export class StripeError extends CustomError {
  constructor(message: string, cause?: unknown) {
    super("StripeError", message, cause)
  }
}

export class RateLimitError extends CustomError {
  constructor(message: string, cause?: unknown) {
    super("RateLimitError", message, cause)
  }
}

export class UploadError extends CustomError {
  constructor(message: string, cause?: unknown) {
    super("UploadError", message, cause)
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string, cause?: unknown) {
    super("UnauthorizedError", message, cause)
  }
}

export class UnknownError extends CustomError {
  constructor(message: string, cause?: unknown) {
    super("UnknownError", message, cause)
  }
}

export class JSONParseError extends CustomError {
  constructor(message: string, cause?: unknown) {
    super("JSONParseError", message, cause)
  }
}
