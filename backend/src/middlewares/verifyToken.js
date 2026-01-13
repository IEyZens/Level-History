import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    res.status(401).json({ error: "Unauthenticated" });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;

    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid token" });
  }
};
