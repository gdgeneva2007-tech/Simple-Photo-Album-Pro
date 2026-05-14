// db/queries.js
const prisma = require("./prisma");

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

// Get one album WITH its photos
async function getAlbumById(id){
  return await prisma.album.findUnique({
    where:{id},
    include:{
      photos:{
        orderBy:{uploadedAt:"desc"}
      }
    }
  })
}

async function createAlbum(name,userId){
  return await prisma.album.create({
    data:{name,userId}
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

async function createPhoto(data){
  return await prisma.photo.create({
    data:{
      name:data.name,
      size:data.size,
      url:data.url,
      cloudinaryId:data.cloudinaryId,
      albumId:data.albumId,
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
  getUserPhotos
};