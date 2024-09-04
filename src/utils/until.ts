export async function until<F extends () => Promise<unknown>, E extends Error>(
  promise: F,
): Promise<[Awaited<ReturnType<F>>, null] | [null, E]> {
  try {
    const result = await promise()

    return [result as Awaited<ReturnType<F>>, null]
  } catch (error) {
    return [null, error as E]
  }
}
