import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import wishlistRoutes from "./routes/wishlistsRoutes.js";
import itemRoutes from "./routes/itemsRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/item", itemRoutes);
app.use("/api/group", groupRoutes);

app.listen(8800, () => {
    console.log("Server running on port 8800");
});
