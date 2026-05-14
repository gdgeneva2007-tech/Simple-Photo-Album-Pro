const db=require("../db/queries")

// POST /albums/:id/share
// Generate a share link with expiry
const createShareLink=async(req ,res ,next)=>{
    try{
        const id=parseInt(req.params.id)
        const album=await db.getAlbumById(id)
        if(!album||album.userId!==parseInt(req.user.id)){
            return res.status(403).render("error",{
                title:"Forbidden",
                message:"That is not your album"
            })
        }

        //User submits duration like "1","7","30"
        const days=parseInt(req.body.days)

        if(isNaN(days)|| days<1 ||days>365){
            return res.redirect(`/albums/${id}`)
        }

        //Calculate expiry data
        // new Date() = right now
        // we add the number of days in milliseconds
        const expiryDate=new Date(
            Date.now()+days*24*60*60*1000
        )

        await db.createShareLink(id,expiryDate)

        res.redirect(`/albums/${id}`)
    }catch(err){
        next(err)
    }
}


// POST /albums/:id/unshare
// Remove the share link
const removeShareLink=async(req ,res, next)=>{
    try{
        const id=parseInt(req.params.id)
        const album=await db.getAlbumById(id)

        if(!album||album.userId!==parseInt(req.user.id)){
            return res.status(403).render("error",{
                title:"Forbidden",
                message:"That is not your album."
            })
        }

        await db.removeShareLink(id)
        res.redirect(`/albums/${id}`)
    }catch(err){
        next(err)
    }
}

// GET /share/:shareId
// Public page - no auth required
// Anyone with the link can view this
const viewSharedAlbum=async (req,res,next)=>{
    try{
        const {shareId}=req.params
        const album=await db.getAlbumByShareId(shareId)

        if (!album || !album.shareId) {
            return res.status(404).render("error", {
                title: "Not Found",
                message: "This share link does not exist."
            });
        }

        // Check if link has expired
        // new Date() = right now
        //album.shareExpiry = when the link was set to expire
        if(new Date()>new Date(album.shareExpiry)){
            return res.render("share/expired",{
                title:"Link expired",
                message:"This share link has expired."
            })
        }

        res.render("share/view",{
            title:`${album.name} - Shared Album`,
            album
            // album.user.firstName and lastName available
            // album.photos available
        })

    }catch(err){
        next(err)
    }
}

module.exports={createShareLink,removeShareLink,viewSharedAlbum}