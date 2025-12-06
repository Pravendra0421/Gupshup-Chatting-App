import axios from "axios";
const CLOUD_NAME="ddguf7pkw";
const UPLOAD_PRESET ="gupshup";
export const UploadToCloudinary = async(file)=>{
    try {
        const formData=new FormData();
        formData.append("file",file);
        formData.append("upload_preset",UPLOAD_PRESET);
        const response = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,formData);
        return response.data.secure_url
    } catch (error) {
        console.log("Cloudinary Error Details:", error.response?.data);
        console.error("Cloudinary Upload Error:", error);
        throw error;
    }
}