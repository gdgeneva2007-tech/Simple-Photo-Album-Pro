# What we are building:

A simple app where users can:

- Sign up and log in
- Create albums (like folders)
- Upload photos into albums
- View photo details
- Delete photos
- Delete albums

# secure_url

secure_url is the FULL web address of your file on Cloudinary's servers

USE IT FOR:
→ Displaying images: <img src="<%= photo.url %>">
→ Download links: <a href="<%= photo.url %>" download>
→ Anything the BROWSER needs to see the file

SAVE IT AS: url in your database

# public_id

public_id is Cloudinary's INTERNAL identifier for your file

USE IT FOR:
→ Deleting a file: cloudinary.uploader.destroy(public_id)
→ Transforming: cloudinary.url(public_id, { width: 300 })
→ Anything the SERVER needs to manage the file

SAVE IT AS: cloudinaryId in your database

NEVER USE IT IN THE BROWSER - it is a server-side tool

# Force download

fl_attachment

const downloadUrl = photo.url.replace(
"/upload/",
"/upload/fl_attachment/"
);
