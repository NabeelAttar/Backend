// project ke liye data hoga file wala thumbnail, video, user ka avatar wagere vo cloudinary se manage hoga
// iske liye hum pehle vo data apne local server me store rakhege aur idhar cloudinary pe daalege multer ke through 
// direct cloudinary pe nhi daalege kyuki agar kuch error aa jaata hai cloudinary se data ud jaata to yaaha se firse reupload wagere kar skte 

import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'
// fs node me by default aati hai aalg se install karne ki zarurat nhi, isse file ko open karke read delete wagere karte

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localfilePath) => {
    try {
        if(!localfilePath) return null;
        const response = await cloudinary.uploader.upload(localfilePath, {
            resource_type: 'auto'
        })
        // file has been uploaded successfully
        // console.log("file is uploaded", response.url);
        // console.log(response);
        
        // successfully cloudinary pe upload karne ke baad unlink kardo synchorously mtlb background me nhi pehle unlink karo fir aage badhege
        fs.unlinkSync(localfilePath)
        return response;
    } catch (error) {
        // yaha pe aaya tu mtlb filepath to thi pr fir bhi upload hone me error aaya , to apanko ye file delete karni padegi local server se
        // iske liye fs.unlink use karte
        fs.unlinkSync(localfilePath)
        return null
    }
}

export {uploadOnCloudinary}