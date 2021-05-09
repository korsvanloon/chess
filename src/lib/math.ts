/**
 * Sums the values of a list of objects calculated by a callback.
 *
 * @example
 * ```js
 * sum([{price: 1}, {price: 2}], x => x.price) // 3
 * ```
 */
export const sum = <T>(items: T[], getValue: (i: T) => number) =>
  items.reduce((p, c) => p + getValue(c), 0)

export const findMin = <T>(items: T[], byValue: (i: T) => number) =>
  items.reduce((a, b) => (byValue(a) < byValue(b) ? a : b))

export const findMax = <T>(items: T[], byValue: (i: T) => number) =>
  items.reduce((a, b) => (byValue(a) > byValue(b) ? a : b))

export const count = <T>(items: T[], predicate: (i: T) => boolean) =>
  items.reduce((p, c) => p + (predicate(c) ? 1 : 0), 0)
