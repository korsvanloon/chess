/**
 * A utility function that returns the result of the `callback` if the predicate is satisfied.
 *
 * Useful for readability purposes.
 *
 * ```ts
 * maybeUndefined ? {value: maybeUndefined!} : undefined
 *
 * ===
 *
 * onlyIf(maybeUndefined, value => ({value}))
 * ```
 */
export const onlyIf = <T, C>(predicate: C | null | undefined | false, callback: (c: C) => T) =>
  predicate ? callback(predicate) : undefined

export const isValue = <T>(value: T): value is NonNullable<T> =>
  value !== null && value !== undefined

/** Removes all undefined properties */
export const pruned = <T>(object: T): T => JSON.parse(JSON.stringify(object))
