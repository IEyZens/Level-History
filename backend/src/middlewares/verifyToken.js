import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies?.jwt;

  if (!token) {
    return res.status(401).json({ message: "Not Authenticated" });
  }

  const secretKey = process.env.JWT_SECRET;

  jwt.verify(token, secretKey, async (err, payload) => {
    if (err) {
      return res.status(403).json({ message: "Token is not valid" });
    }

    req.userId = payload.id;
    req.userRole = payload.role;

    next();
  });
};
