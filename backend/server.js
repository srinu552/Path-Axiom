require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

const authRoutes = require("./Routes/auth");
const employeeRoutes = require("./Routes/employeeRoutes");
const errorHandler = require("./middleware/errorMiddleware");
const payrollRoutes = require("./Routes/payrollRoutes");
const attendanceRoutes = require("./Routes/attendance");
const adminRoutes = require("./Routes/adminRoutes");
const employeeDashboardRoutes = require("./Routes/employeeDashboardRoutes");
const leaveRoutes = require("./Routes/leaveRoutes");
const profileRoutes = require("./Routes/profileRoutes");
const adminProfileRoutes = require("./Routes/adminProfileRoutes");
const roleRoutes = require("./Routes/roleRoutes");
const reviewRoutes = require("./Routes/reviewRoutes");
const appraisalRoutes = require("./Routes/appraisalRoutes");
const teamRoutes = require("./Routes/teamRoutes");

const app = express();

/* ================= BASIC APP SECURITY ================= */

app.set("trust proxy", 1);
app.disable("x-powered-by");

/* ================= ALLOWED ORIGINS ================= */

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_2,
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // Postman / server-to-server / mobile apps

  try {
    const url = new URL(origin);
    const hostname = url.hostname;

    // local dev
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return true;
    }

    // allow your exact env frontend URLs
    if (allowedOrigins.includes(origin)) {
      return true;
    }

    // allow Vercel deployments
    if (hostname.endsWith(".vercel.app")) {
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
};

/* ================= SECURITY MIDDLEWARE ================= */

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      console.log("Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(hpp());
app.use(compression());

/* ================= BODY PARSER ================= */

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

/* ================= LOGGING ================= */

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/* ================= RATE LIMIT ================= */

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login/register attempts. Please try again later.",
  },
});

app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);

/* ================= HEALTH CHECK ================= */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running 🚀",
    environment: process.env.NODE_ENV || "development",
  });
});

/* ================= ROUTES ================= */

// Put admin profile before general admin routes to avoid route conflicts
app.use("/api/admin", adminProfileRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/employee-dashboard", employeeDashboardRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/appraisals", appraisalRoutes);
app.use("/api/teams", teamRoutes);


/* ================= 404 HANDLER ================= */

app.use((req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

/* ================= ERROR HANDLER ================= */

app.use(errorHandler);

/* ================= SERVER ================= */

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});