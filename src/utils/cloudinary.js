import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFileOnCloud = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const uploadedFileResponse = cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        console.log("File uploaded on cloudinary - ", uploadedFileResponse);
        return uploadedFileResponse;
    } catch (error) {
        return null;
    }
};

export { uploadFileOnCloud };
