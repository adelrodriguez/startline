class CustomError extends Error {
  constructor(name: string, message: string, cause?: Error) {
    super(message)
    this.name = name
    if (cause) this.cause = cause
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class AssertionError extends CustomError {
  constructor(message?: string, cause?: Error) {
    super("AssertionError", message || "Assertion failed", cause)
  }
}

export class AuthError extends CustomError {
  constructor(message: string, cause?: Error) {
    super("AuthError", message, cause)
  }
}

export class ContextError extends CustomError {
  constructor(message: string, cause?: Error) {
    super("ContextError", message, cause)
  }
}

export class NotFoundError extends CustomError {
  constructor(resource: string, id: string, cause?: Error) {
    super("NotFoundError", `${resource} with id ${id} not found`, cause)
  }
}

export class ValidationError extends CustomError {
  constructor(message: string, cause?: Error) {
    super("ValidationError", message, cause)
  }
}

export class QueryError extends CustomError {
  constructor(queryName: string, cause?: Error) {
    super("QueryError", `Invalid query params provided for ${queryName}`, cause)
  }
}

export class SendEmailError extends CustomError {
  constructor(name: string, message: string, email: string, cause?: Error) {
    super(
      "SendEmailError",
      `Error sending email to ${email}. ${name}: ${message}`,
      cause,
    )
  }
}

export class PasswordResetError extends CustomError {
  constructor(message: string, cause?: Error) {
    super("PasswordResetError", message, cause)
  }
}

export class OrganizationError extends CustomError {
  constructor(message: string, cause?: Error) {
    super("OrganizationError", message, cause)
  }
}

export class OrganizationInvitationError extends CustomError {
  constructor(message: string, cause?: Error) {
    super("OrganizationInvitationError", message, cause)
  }
}

export class InternalError extends CustomError {
  constructor(message: string, cause?: Error) {
    super("InternalError", message, cause)
  }
}

export class StripeError extends CustomError {
  constructor(message: string, cause?: Error) {
    super("StripeError", message, cause)
  }
}

export class RateLimitError extends CustomError {
  constructor(message: string, cause?: Error) {
    super("RateLimitError", message, cause)
  }
}
