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

export class NotFoundError extends Error {}

export class ValidationError extends Error {}

export class InternalError extends Error {}

export class StripeError extends Error {}
