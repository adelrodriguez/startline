type Event<T> = {
  data: T
}

type EventMap = {
  "demo/hello-world": { date: Date }
}

export type Events = { [key in keyof EventMap]: Event<EventMap[key]> }
