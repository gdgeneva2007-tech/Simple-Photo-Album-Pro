const db=require("../db/queries")

const getNewAlbumForm=async (req,res,next)=>{
    try{
        // Check if creating inside a parent album
        const parentId=req.query.parentId?parseInt(req.query.parentId):null;
        let parentAlbumName=null;
        if(parentId){
            const parent=await db.getAlbumById(parentId)
            if(parent&&parent.userId===parseInt(req.user.id)){
                parentAlbumName=parent.name
            }
        }

        res.render("albums/form",{
            title:"Create Album",
            formAction:"/albums/new",
            formData:{},
            errors:[],
            parentId,
            parentAlbumName
        })
    }catch(err){
        next(err)
    }
}

// When creating an album, accept optional parentId
const postNewAlbum=async (req,res,next)=>{
    try{
        const name=req.body.name?req.body.name.trim():""

        //parentId comes from a hidden input or query param
        const parentId=req.body.parentId?parseInt(req.body.parentId):null
        if(!name){
            return res.render("albums/form",{
                title:"Create Album",
                formAction:"/albums/new",
                formData:req.body,
                errors:[{msg:"Album name is required."}]
            })
        }

        // if parentId provided, verify it belongs to this user
        if(parentId){
            const parentAlbum=await db.getAlbumById(parentId)
            if(!parentAlbum||parentAlbum.userId!==parseInt(req.user.id)){
                return res.status(403).render("error",{
                    title:"Forbidden",message:"That is not your album"
                })
            }

        }

        const album=await db.createAlbum(name,parseInt(req.user.id),parentId)
        //Redirecting to parent if created inside one
        if(parentId){
            res.redirect(`/albums/${parentId}`)
        }else{
            res.redirect("/")
        }
        
    }catch(err){
        next(err)
    }
}

const getAlbum=async (req,res,next)=>{
    try{
        const id=parseInt(req.params.id)
        if(isNaN(id))return res.status(404).render("error",{title:"Not Found",message:"Album not found."})
        const album=await db.getAlbumById(id)
        if(!album)return res.status(404).render("error",{title:"Not Found",message:"Album not found."})
        
        // Make sure user owns this album
        if(album.userId!==req.user.id){
            return res.status(403).render("error",{title:"Forbidden",message:"This is not your album."})
        }

        res.render("albums/detail",{
            title:album.name,
            album
            // album.photos is included from the query
        })
    }catch(err){
        next(err)
    }
}

const getEditAlbumForm=async (req,res,next)=>{
    try{
        const id=parseInt(req.params.id)
        if(isNaN(id))return res.status(404).render("error",{title:"Not found",message:"Album not found"})
        const album=await db.getAlbumById(id)
        if(!album)return res.status(404).render("error",{title:"Not found",message:"Album not found."})
        if(album.userId!==parseInt(req.user.id))return res.status(403).render("error",{title:"Forbidden",message:"This is not your album"})
        
        res.render("albums/form",{
            title:"Rename Album",
            formAction:`/albums/${id}/edit`,
            formData:album,
            errors:[]
        })
    }catch(err){
        next(err)
    }
}

const postEditAlbum=async (req,res,next)=>{
    try{
        const id=parseInt(req.params.id)
        if(isNaN(id))return res.status(404).render("error",{title:"Not found",message:"Album not found."})
        
        const album=await db.getAlbumById(id)
        if(!album)return res.status(404).render("error",{title:"Not found",message:"Album not found."})
        if(album.userId!==parseInt(req.user.id))return res.status(403).render("error",{title:"Forbidden",message:"This is not your album."})

        const name=req.body.name?req.body.name.trim():""
        if(!name){
            return res.render("albums/form",{
                title:"Rename Album",
                formAction:`/albums/${id}/edit`,
                formData:req.body,
                errors:[{msg:"Album name is required."}]
            })
        }

        await db.renameAlbum(id,name)
        res.redirect(`/albums/${id}`)
    }catch(err){
        next(err)
    }
}

const deleteAlbum=async(req,res,next)=>{
    try{
        const id=parseInt(req.params.id)
        if(isNaN(id)){
            return res.status(404).render("error",{title:"Not found",message:"Album not found"})
        }
        const album=await db.getAlbumById(id)
        if(!album)return res.status(404).render("error",{title:"Not found",message:"Album not found"})
        if(album.userId!==parseInt(req.user.id)){
            return res.status(403).render("error",{
                title:"Forbidden",
                message:"This is not your album."
            })
        }

        // Delete photos from Cloudinary first
        // because cascade deletes them from db NOT from Cloudinary
        const {deleteFromCloudinary}=require("../utils/cloudinaryUpload")
        for(const photo of album.photos){
            await deleteFromCloudinary(photo.cloudinaryId)
        }

        // Now delete album (photos deleted from db automatically by cascade)
        await db.deleteAlbum(id)
        res.redirect("/")
    }catch(err){
        next(err)
    }
}

module.exports={
    getNewAlbumForm,
    postNewAlbum,
    getAlbum,
    getEditAlbumForm,
    postEditAlbum,
    deleteAlbum
}