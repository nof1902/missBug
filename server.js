import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";


// dev env - here defined ports/URL that allowed to send req to server
const corsOptions = {
  origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
  // credentials - allows to receive the "casing" that comes with a request - header for example
  credentials: true,
};


const app = express();
// The node server's default operation does not allow receiving different detailed readings
// Cors - allowed to communicated between front & back at develope time - through different ports
app.use(cors(corsOptions));

// production env - instructing the Express app to automatically serve any file stored in the public directory - the front app most of th e time
app.use(express.static("public"));

// instructing the app about the data format will transfer - json
app.use(express.json());

// using cookies
app.use(cookieParser());

// ======================
// end points
// ======================
import { bugRoutes } from "./api/bug/bug.routes.js";
import { userRoutes } from "./api/user/user.routes.js";
import { authRoutes } from "./api/auth/auth.routes.js";
import { msgRoutes } from "./api/msg/msg.routes.js";

// while encotering this path -> go to this file and manage routing
app.use("/api/bug", bugRoutes);
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/msg", msgRoutes);


// ======================
// fronend end point
// ======================
app.get("/**", (req, res) => {
  res.sendFile(path.resolve("public/index.html"));
});

import { loggerService } from "./services/logger.service.js";
const port = process.env.PORT || 3030;
app.listen(port, () => {
  loggerService.info("Server ready on port", port);
});
