// db/queries.js
const { PureComponent } = require("react");
const prisma = require("./prisma");
const {v4:uudiv4}=require("uuid")

// Create or update share link
async function createShareLink(albumId,expiryDate){
  const shareId=uudiv4()
  // uuidv4() generates something like:
  // "c758c495-0705-44c6-8bab-6635fd12cf81"
  return await prisma.album.update({
    where:{id:albumId},
    data:{
      shareId:shareId,
      shareExpiry:expiryDate
    }
  })
}

// Remove share link
async function removeShareLink(albumId){
  return await prisma.album.update({
    where:{id:albumId},
    data:{
      shareId:null,
      shareExpiry:null
    }
  })
}

// Find album by shareId (for public access)
async function getAlbumByShareId(shareId){
  return await prisma.album.findUnique({
    where:{shareId},
    include:{
      photos:{orderBy:{uploadedAt:"desc"}},
      user:{select:{firstName:true,lastName:true}}
    }
  })
}

async function getUserByEmail(email) {
  return await prisma.user.findUnique({
    where: { email: email }
  });
}

async function getUserById(id) {
  return await prisma.user.findUnique({
    where: { id: id }
  });
}

async function createUser(user) {
  return await prisma.user.create({
    data: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
    }
  });
}

// add your project queries below

// Get only ROOT albums (no parent) for the dashboard
async function getUserRootAlbums(userId){
  return await prisma.album.findMany({
    where:{
      userId,
      parentId:null
    },
    include:{
      children:true,  // include sub-albums
      _count:{select:{photos:true}}
    },
    orderBy:{createdAt:"desc"}
  })
}



async function getUserAlbums(userId){
  return await prisma.album.findMany({
    where:{userId},
    // include _count to show how many photos in each album
    //_count is a Prisma feature that counts related records
    include:{
      _count:{
        select:{photos:true}
        //this adds: album._count.photos=number of photos
      }
    },
    orderBy:{createdAt:"desc"}
  })
}

// Get album with its children and photos 
async function getAlbumById(id){
  return await prisma.album.findUnique({
    where:{id},
    include:{
      photos:{
        orderBy:{uploadedAt:"desc"}
      },
      children:{
        include:{
          _count:{select:{photos:true}}
        }
      },
      parent:{
        select:{id:true,name:true}
        // for breadcrumb navigation
      }
    }
  })
}

// Create album with optional parent
async function createAlbum(name,userId,parentId=null){
  return await prisma.album.create({
    data:{name,userId,parentId}
  })
}

async function renameAlbum(id,name){
  return await prisma.album.update({
    where:{id},
    data:{name}
  })
}

// Delete album - photos are deleted automatically
// because of onDelete: Cascade in schema
async function deleteAlbum(id){
  return await prisma.album.delete({
    where:{id}
  })
}

// PHOTO QUERIES
async function getPhotoById(id){
  return await prisma.photo.findUnique({
    where:{id},
    // include album name so we can show it on detail page
    include:{
      album:{
        select:{name:true,id:true}
      }
    }
  })
}

async function getUnorganizedPhotos(userId){
  return await prisma.photo.findMany({
    where:{
      userId,
      albumId:null
    },
    orderBy:{uploadedAt:"desc"}
  })
}

// Update createPhoto to handle null albumId
async function createPhoto(data){
  return await prisma.photo.create({
    data:{
      name:data.name,
      size:data.size,
      url:data.url,
      cloudinaryId:data.cloudinaryId,
      albumId:data.albumId||null,
      userId:data.userId
    }
  })
}

async function deletePhoto(id){
  return await prisma.photo.delete({
    where:{id}
  })
}

// Get all photos belonging to a user
// Used to delete all user photos from cloudinary on account delete
async function getUserPhotos(userId){
  return await prisma.photo.findMany({
    where:{userId}
  })
}

module.exports = {
  getUserByEmail,
  getUserById,
  createUser,
  getUserAlbums,
  getAlbumById,
  createAlbum,
  renameAlbum,
  deleteAlbum,
  getPhotoById,
  createPhoto,
  deletePhoto,
  getUserPhotos,
  getUnorganizedPhotos,getAlbumByShareId
};