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

export class OrganizationError extends Error {}

export class InternalError extends Error {}

// Service errors
export class StripeError extends Error {}
export class InngestError extends Error {}

/**
 * Gracefully handle errors as values.
 *
 * @example
 * ```ts
 * const [error, data] = await until(() => asyncAction())
 *
 * if (error) {
 *   // handle error
 *   return
 * }
 *
 * // data is now the response from asyncAction
 * ```
 */
export async function until<
  F extends (...args: unknown[]) => Promise<unknown>,
  E extends Error = Error,
>(promise: F): Promise<[null, Awaited<ReturnType<F>>] | [E, null]> {
  try {
    const data = await promise()

    return [null, data as Awaited<ReturnType<F>>]
  } catch (error) {
    return [error as E, null]
  }
}
