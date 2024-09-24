/* @flow strict-local */

import { objectFromEntries } from '../jsBackport';

export const caseInsensitiveCompareFunc = (a: string, b: string): number =>
  a.toLowerCase().localeCompare(b.toLowerCase());

export function deeperMerge<K, V>(
  obj1: $ReadOnly<{| [K]: V |}>,
  obj2: $ReadOnly<{| [K]: V |}>,
): {| [K]: V |} {
  const mergedKeys = Array.from(new Set([...Object.keys(obj1), ...Object.keys(obj2)]));
  return objectFromEntries(
    mergedKeys.map(key =>
      // Prettier bug on nested ternary
      /* prettier-ignore */
      [key,
       obj1[key] === undefined
         ? obj2[key]
         : obj2[key] === undefined
           ? obj1[key]
           : { ...obj1[key], ...obj2[key] }],
    ),
  );
}

export const isValidEmailFormat = (email: string = ''): boolean => /\S+@\S+\.\S+/.test(email);

/** Return an integer start <= N < end, roughly uniformly at random. */
export const randInt = (end: number, start: number = 0): number =>
  Math.floor(Math.random() * (end - start) + start);

/** Return a string that's almost surely different every time. */
export const randString = (): string => randInt(2 ** 54).toString(36);
