import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PORT } from "./config/constants.js";
import connectToDb from "./db/connect.js";
import userRouter from "./routes/user.route.js";
import bookRouter from "./routes/book.route.js";
import adminRouter from "./routes/admin.route.js";
import borrowRouter from "./routes/borrow.route.js";
const app = express();
connectToDb();
app.use(
    cors({
        // origin: process.env.CORS_ORIGIN || "*",
        // origin: "https://prashika-mel-frontend.vercel.app",
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(cookieParser());
app.use(express.json({ limit: "20mb" }));
app.use(urlencoded({ extended: true, limit: "20mb" }));
app.use(express.static("public"));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/books", bookRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/borrow", borrowRouter);

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});