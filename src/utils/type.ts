export type StrictOmit<T, K extends keyof T> = Omit<T, K>

export type Spread<T1, T2> = T2 & Omit<T1, keyof T2>
