import express from "express";
import { addWishlist, deleteWishlist, getWishlist, getWishlists, updateWishlist } from "../controllers/wishlists.js";

const router = express.Router();

router.get("/all/:user", getWishlists);
router.get("/:id_wishlist", getWishlist);
router.post("/", addWishlist);
router.delete("/:id_wishlist", deleteWishlist);
router.put("/", updateWishlist);

export default router;
