const { selectFields } = require("express-validator/lib/field-selection")
const db=require("../db/queries")
const {uploadToCloudinary,deleteFromCloudinary}=require("../utils/cloudinaryUpload")

// GET /photos/upload
// Show upload form
// Optional: ?albumId=1 pre-selects the album
const getUploadForm=async (req ,res,next)=>{
    try{
        const albums=await db.getUserAlbums(parseInt(req.user.id))
        res.render("photos/upload",{
            title:"Upload Photo",
            albums,
            //pre-select album if coming from an album page
            selectedAlbumId:req.query.albumId||"",
            error:null
        })
    }catch(err){
        next(err)
    }
}

// POST /photos/upload
// Multer runs first in the route (req.file is ready here)
const uploadPhoto=async (req,res,next)=>{
    try{
        // req.file is provided by multer
        // if no file was selected, req.file is undefined
        if(!req.file){
            const albums=await db.getUserAlbums(parseInt(req.user.id))
            return res.render("photos/upload",{
                title:"Upload Photo",
                albums,
                selectedAlbumId:parseInt(req.body.albumId)||"",
                error:"Please select a photo to upload."
            })
        }

        // albumId is now optional
        // if user did not select an album, it is null
        const albumId=req.body.albumId?parseInt(req.body.albumId):null
        
        // Only verify album ownership if an album was selected

        if(albumId){
            const album=await db.getAlbumById(albumId)
            if(!album || album.userId!==parseInt(req.user.id)){
                return res.status(403).render("error",{
                    title:"Forbidden",
                    message:"That is not your album"
                })
            }
        }
        

        // CLOUDINARY UPLOAD
        // req.file.buffer = the file data from multer memory storage
        // uploadToCloudinary sends it to Cloudinary
        // and returns the result object

        const result=await uploadToCloudinary(
            req.file.buffer,
            "photo-album-pro"   //Cloudinary folder name for this project
        )

        // result.secure_url = "https://res.cloudinary.com/your-cloud/image/upload/..."
        // result.public_id= "photo-album/abc123xyz"

        // Save photo info to database
        await db.createPhoto({
            name:req.file.originalname, //"beach.jpg"
            size:req.file.size, // 204800 (bytes)
            url:result.secure_url,  //cloudinary URL
            cloudinaryId:result.public_id,  //needed to delete later
            albumId:albumId,
            userId:parseInt(req.user.id)
        })

        //Redirect to album if one was selected, otherwise to home
        if(albumId){
            res.redirect(`/albums/${albumId}`)
        }
        else{
            res.redirect("/")
        }
        
    }catch(err){
        next(err)
    }
}

// GET /photos/:id
// View photo details
const getPhotoDetail=async (req,res,next)=>{
    try{
        const id=parseInt(req.params.id)
        if(isNaN(id))return res.status(404).render("error",{title:"Not Found",message:"Photo not found."})
        const photo=await db.getPhotoById(id)
        if(!photo)return res.status(404).render("error", { title: "Not Found", message: "Photo not found." });
        if(photo.userId!==parseInt(req.user.id)){
            return res.status(403).render("error", { title: "Forbidden", message: "This is not your photo." });
        }

        const downloadUrl=photo.url.replace(
            "/upload/",
            "/upload/fl_attachment/"
        )
        // Format file size for display
        // We convert bytes to a human readable string
        const formatSize=(bytes)=>{
            if(bytes<1024)return `${bytes} B`
            if(bytes<1024*1024)return `${(bytes/1024).toFixed(1)} KB`
            return `${(bytes/(1024*1024)).toFixed(1)} MB`
        }

        res.render("photos/detail",{
            title:photo.name,
            photo,
            downloadUrl,    // pass this to EJS
            formattedSize:formatSize(photo.size)
            // photo.album.name is available from the include in getPhotoById
        })
    }catch(err){
        next(err)
    }
}

// POST /photo/:id/delete
const deletePhoto=async(req,res,next)=>{
    try{
        const id=parseInt(req.params.id)
        if (isNaN(id)) return res.status(404).render("error", { title: "Not Found", message: "Photo not found." });

        const photo = await db.getPhotoById(id);
        if (!photo) return res.status(404).render("error", { title: "Not Found", message: "Photo not found." });
        if (photo.userId !== req.user.id) return res.status(403).render("error", { title: "Forbidden", message: "This is not your photo." });
        
        // Step 1: Delete from Cloudinary
        // If we delete from db first and Cloudinary fails,
        // we have a broken record pointing to a deleted file
        // So always delete from Cloudinary FIRST
        await deleteFromCloudinary(photo.cloudinaryId)

        // Step 2: Delete from database
        await db.deletePhoto(id)

        // Go back to the album this photo was in
        res.redirect(`/albums/${photo.albumId}`)
    }catch(err){
        next(err)
    }
}

module.exports={
    getUploadForm,
    uploadPhoto,
    getPhotoDetail,
    deletePhoto
}