// routes/index.js
// TEMPLATE: just a home page, fill in the controller logic

const express = require("express");
const router = express.Router();

const {ensureLoggedIn}=require("../middleware/auth")
const db=require("../db/queries")

router.get("/",ensureLoggedIn,async (req ,res,next)=>{
  try{
    const albums=await db.getUserAlbums(parseInt(req.user.id))
    res.render("index",{title:"My Photo Albums",albums})
  }catch(err){
    next(err)
  }
})

module.exports = router;