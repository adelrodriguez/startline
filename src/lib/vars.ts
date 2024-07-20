import env from "@/lib/env.server"

export const isDevelopment = env.NODE_ENV === "development"
export const isTest = env.NODE_ENV === "test"
export const isProduction = env.NODE_ENV === "production"
