export const getHelmetConfig = (env) => {
  const isProduction = env === "production";
  const isDevelopment = env === "development" || env === "test";

  return {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", ...(isDevelopment ? ["'unsafe-eval'"] : [])],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'"],
        connectSrc: ["'self'", ...(isDevelopment ? ["ws:", "wss:"] : [])],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    strictTransportSecurity: isProduction
      ? {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        }
      : false,
    xFrameOptions: {
      action: "deny",
    },
    xDnsPrefetchControl: {
      allow: false,
    },
    xPermittedCrossDomainPolicies: {
      permittedPolicies: "none",
    },
    referrerPolicy: {
      policy: "strict-origin-when-cross-origin",
    },
  };
};
