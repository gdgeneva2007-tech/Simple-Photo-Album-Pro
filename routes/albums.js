const express=require("express")
const router=express.Router();
const {ensureLoggedIn}=require("../middleware/auth")
const albumController=require("../controllers/albumController")

// Show create album form
router.get("/new",ensureLoggedIn,albumController.getNewAlbumForm)

// Handle create album
router.post("/new",ensureLoggedIn,albumController.postNewAlbum)

// Show album contents
router.get("/:id",ensureLoggedIn,albumController.getAlbum)

// Show rename form
router.get("/:id/edit",ensureLoggedIn,albumController.getEditAlbumForm)

// Handle rename
router.post("/:id/edit",ensureLoggedIn,albumController.postEditAlbum)

// Delete album
router.post("/:id/delete",ensureLoggedIn,albumController.deleteAlbum)

module.exports=router