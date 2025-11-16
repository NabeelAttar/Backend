// custom middleware banayege abhi hum logout ke liye 
import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from '../utils/apiError.js'
import jwt from 'jsonwebtoken'
import {User} from '../models/user.models.js'

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // tune app.js me app.use(cookieParser()) kiya tha isliye req aur res me .cookie field available hai 
        // access token nikaalna hoga vo login karte hue generate hua hoga to req.cookies me avaiable hoga ya to mobile app ya postman jb server hit karega
        // to unko cookies ka access nhi hota to unke liye authorization header me tokens hote. this is the syntax postman me headers ke andar:
        // Authorization: Bearer <token_name>
        const Token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "") 
    
        if(!Token){
            throw new apiError(401, "Unauthorized Request")
        }
    
        // token generate karte wakt jo jo return hua tha token me jaise id username fullname etc vo decode karna hai 
        const decodedToken = jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user) throw new apiError(401, "Invalid Access Token")
    
        req.user = user  //is middleware ki wajah se ab mujhe logoutUser function me req field me user ka accesss milega 
        next()
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid Access Token")
    }
})