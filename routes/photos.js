const express=require("express")
const router=express.Router()
const {ensureLoggedIn}=require("../middleware/auth")
const upload=require("../middleware/upload")
const multer=require("multer")
const photoController=require("../controllers/photoController")

// Show upload form
router.get("/upload",ensureLoggedIn,photoController.getUploadForm)

// Handle file upload
// upload.single("photo") runs before the controller
// "photo" must match name="photo" in your HTML form input
router.post(
    "/upload",
    ensureLoggedIn,
    // Handle multer errors here in the route
    // so we can render a nice error page instead of crashing 
    (req,res,next)=>{
        upload.single("photo")(req,res,(err)=>{
            if(err instanceof multer.MulterError){
                //Built-in multer error (fiel too large etc.)
                if(err.code==='LIMIT_FILE_SIZE'){
                    return res.render("photos/upload",{
                        title:"Upload Photo",
                        error:"File is too large. Maximum size is 5MB",
                        albumId:req.query.albumId||""
                    })
                }
                return res.render("photos/upload",{
                    title:"Upload Photo",
                    error:err.message,
                    albumId:req.query.albumId||""
                })
            }else if(err){
                // Our custom fileFilter error
                return res.render("photos/upload",{
                    title:"Upload Photo",
                    error:err.message,
                    albumId:req.query.albumId||""
                })
            }
            // No error - go to controller
            next()
        })
    },
    photoController.uploadPhoto
)

// View photo details
router.get("/:id",ensureLoggedIn,photoController.getPhotoDetail)

// Delete photo
router.post("/:id/delete",ensureLoggedIn,photoController.deletePhoto)

module.exports=router