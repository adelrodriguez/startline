export async function until<
  F extends (...args: unknown[]) => Promise<unknown>,
  E extends Error = Error,
>(promise: F): Promise<[Awaited<ReturnType<F>>, null] | [null, Error]> {
  try {
    const data = await promise()

    return [data as Awaited<ReturnType<F>>, null]
  } catch (error) {
    return [null, error as E]
  }
}
