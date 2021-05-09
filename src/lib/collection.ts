export const last = <T>(items: T[]) => items[items.length - 1]
/**
 * Generates an ascending numerical array of size `length`, starting at `start`.
 *
 * @example
 * ```ts
 * range({start: 1, length: 3}) // [1,2,3]
 * ```
 */
export const range = ({ length, start = 0 }: { length: number; start?: number }) =>
  Array.from({ length }, (_, i) => i + start)

/**
 * Divides an array in an `amount` of sub-arrays.
 *
 * @example
 * ```ts
 * divideInChunks([1,2,3,4,5,6], 2) // [[1,2,3], [4,5,6]]
 * ```
 */
export function divideInChunks<T>(items: T[], amount: number): T[][] {
  const result: T[][] = []
  const chunkSize = Math.ceil(items.length / amount)

  for (let i = 0; i < amount; i++) {
    result.push(items.slice(chunkSize * i, chunkSize * (i + 1)))
  }

  return result
}

export const unique = <T>(items: T[]) => [...new Set(items)]

export const hasDifferentValues = <T>(keys: (keyof T)[], a: T, b: T) =>
  keys.some((k) => a[k] !== b[k])

/**
 * Groups a list based on a callback.
 * Returns a Map where the keys are the result of the callback.
 *
 * @example
 * ```ts
 * groupBy(
 *   [{age: 18, name: 'John'}, {age: 18, name: 'Joe'}, {age: 16, name: 'Jack'}],
 *   p => p.age,
 * )
 * ```
 *
 * results in
 *
 * ```
 * Map {
 *  16: [{age: 16, name: 'Jack'}],
 *  18: [{age: 18, name: 'John'}, {age: 18, name: 'Joe'}],
 * }
 * ```
 */
export const groupBy = <T, S>(list: T[], keyGetter: (i: T) => S) => {
  const map = new Map<S, T[]>()
  list.forEach((item) => {
    const key = keyGetter(item)
    const collection = map.get(key)
    if (!collection) {
      map.set(key, [item])
    } else {
      collection.push(item)
    }
  })
  return map
}

/**
 * Filter a list of objects on some unique value.
 *
 * @example
 * ```ts
 * getUniqueObjects(
 *   [{age: 18, name: 'John'}, {age: 18, name: 'Joe'}, {age: 16, name: 'Jack'}],
 *   p => p.age,
 * )
 * ```
 *
 * results in
 *
 * ```
 *   [{age: 18, name: 'John'}, {age: 16, name: 'Jack'}],
 * ```
 */
export const getUniqueObjects = <T, S>(items: T[], keyGetter: (i: T) => S) => {
  const uniqueIds = new Set<S>()
  return items.filter((obj) =>
    !uniqueIds.has(keyGetter(obj)) ? uniqueIds.add(keyGetter(obj)) : false
  )
}
