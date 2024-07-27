export class AssertionError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = "AssertionError"
  }
}

export class AuthError extends Error {}

export class ContextError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ContextError"
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "NotFoundError"
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ValidationError"
  }
}

export class QueryError extends Error {
  constructor(queryName: string) {
    super(`Invalid query params provided for ${queryName}`)
    this.name = "QueryError"
  }
}

export class SendEmailError extends Error {
  constructor(name: string, message: string, email: string) {
    super(`Error sending email to ${email}. ${name}: ${message}`)
    this.name = "SendEmailError"
  }
}

export class PasswordResetError extends Error {}

export class InternalError extends Error {}

export class StripeError extends Error {}
