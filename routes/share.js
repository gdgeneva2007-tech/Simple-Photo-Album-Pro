const express=require("express")
const router=express.Router()
const {viewSharedAlbum}=require("../controllers/shareController")

// No auth middleware - anyone can access this
router.get("/:shareId",viewSharedAlbum)

module.exports=router