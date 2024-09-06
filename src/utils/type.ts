export type StrictOmit<T, K extends keyof T> = Omit<T, K>

declare const __brand: unique symbol
type Brand<B> = { [__brand]: B }

export type Branded<T, B> = T & Brand<B>

export type Spread<T1, T2> = T2 & Omit<T1, keyof T2>
