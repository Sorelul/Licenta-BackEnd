import express from "express";
import {
    addWishlist,
    deleteWishlist,
    getWishlist,
    getWishlists,
    updateWishlist,
    getOwnedWishlist,
    getWishlistsForUserFromGroup,
} from "../controllers/wishlists.js";

const router = express.Router();

router.get("/all/:user", getWishlists);
router.get("/alllistsofmemberfromgroup/:user/:group", getWishlistsForUserFromGroup);
router.get("/owned", getOwnedWishlist);
router.get("/:id_wishlist", getWishlist);
router.post("/", addWishlist);
router.delete("/:id_wishlist", deleteWishlist);
router.put("/", updateWishlist);

export default router;
