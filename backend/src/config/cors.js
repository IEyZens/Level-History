export const getCorsConfig = (allowedOrigins, env) => {
  return {
    origin: (origin, callback) => {
      // Always allow in test environment
      if (env === "test") {
        return callback(null, true);
      }

      // No origin (Postman, curl, etc.)
      if (!origin) {
        // Allow in development, block in production
        if (env === "development") {
          return callback(null, true);
        } else {
          return callback(new Error("Not allowed by CORS"));
        }
      }

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.error(`CORS blocked: ${origin}`);
        console.error(`Allowed origins: ${allowedOrigins.join(", ")}`);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
    maxAge: 86400, // 24 hours
  };
};
