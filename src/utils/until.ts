export async function until<F extends () => Promise<unknown>, E extends Error>(
  promise: F,
): Promise<[null, Awaited<ReturnType<F>>] | [E, null]> {
  try {
    const result = await promise()

    return [null, result as Awaited<ReturnType<F>>]
  } catch (error) {
    return [error as E, null]
  }
}
