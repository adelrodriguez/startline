import { createRouteHandler } from "uploadthing/next"

import { fileRouter } from "~/services/uploadthing"

export const { GET, POST } = createRouteHandler({
  router: fileRouter,
})
