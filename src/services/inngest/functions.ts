import inngest from "./client"

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "demo/hello-world" },
  async ({ event, step }) => {
    await step.sleep("wait-five-seconds", "5s")

    console.log("Hello, World!")

    return { event, body: "Hello, World!" }
  },
)
