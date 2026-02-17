import sanitizeHtml from "sanitize-html";

export const sanitize = (input) => {
  if (typeof input !== "string") {
    return input;
  } else {
    return sanitizeHtml(input, {
      allowedTags: [],
      allowedAttributes: {},
      disallowedTagsMode: "recursiveEscape",
      selfClosing: [],
      parser: {
        decodeEntities: true,
      },
    });
  }
};

export const sanitizeObject = (obj) => {
  const sanitized = {};

  for (const key in obj) {
    if (typeof obj[key] === "string") {
      sanitized[key] = sanitize(obj[key]);
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      sanitized[key] = sanitizeObject(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }

  return sanitized;
};
