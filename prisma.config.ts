import 'dotenv/config'

export default {
  datasource: {
    url: process.env.DATABASE_URL,
    // Only include shadowDatabaseUrl if provided
    ...(process.env.SHADOW_DATABASE_URL
      ? { shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL }
      : {}),
  },
}
