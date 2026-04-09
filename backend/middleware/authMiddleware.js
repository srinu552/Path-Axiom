const jwt = require("jsonwebtoken");

/* ================= VERIFY TOKEN ================= */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      ...decoded,
      id: decoded.id,
      role: String(decoded.role || "").trim().toLowerCase(),
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired. Please login again.",
      });
    }

    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};

/* ================= ROLE AUTHORIZATION ================= */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        message: "Unauthorized access",
      });
    }

    const userRole = String(req.user.role).trim().toLowerCase();
    const allowedRoles = roles.map((r) => String(r).trim().toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "Access forbidden: insufficient permissions",
      });
    }

    next();
  };
};

module.exports = { verifyToken, authorizeRoles };