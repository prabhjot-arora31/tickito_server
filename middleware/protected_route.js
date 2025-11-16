import jwt from "jsonwebtoken";

const protectedRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized, token missing" });
    }

    const token = authHeader.split(" ")[1]; // "Bearer <token>"

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = decoded; // entire payload
    req.userId = decoded.id; // convenient shortcut

    next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized, invalid token" });
  }
};

export default protectedRoute;
