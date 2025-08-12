import { httpRouter } from "convex/server"
import { createAuth } from "../src/shared/auth/server"
import { betterAuthComponent } from "./auth"

const http = httpRouter()

betterAuthComponent.registerRoutes(http, createAuth)

export default http
