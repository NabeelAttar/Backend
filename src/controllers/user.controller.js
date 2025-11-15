import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from '../models/user.models.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { apiResponse } from "../utils/apiResponse.js"
const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // details json format me ya forontend ke forms se liya jaayega , jo req.body me milta aur url se data hoga agar to alag procedure hoti
    const { fullname, username, email, password} = req.body
    // yaha pe image files avatar wagere nhi handle hua - files ko alag se handle karege user.routes.js - line 7

    // console.log(req.body);
    
    // validation - check if the fields are not empty , email aur username wagere correct format hai kya 
    if([fullname, username, email, password].some((field) => field?.trim() === "")){
        // kisi ke liye bhi true value aati hai mtlb vo field empty hai - apiError throw karo , apiError (statuscode aur acha message expect karta)
        throw new apiError(400, "All fields are required")
    }


    // check if user already exists - username or email should be unique
    // we will use findOne method mtlb first value jo match kar gyi vo return hogi and $or operation lagayege username and email dono me
    // agar username OR email same nikal gaya to vo user return karo , User jo h vo mongoose se banaya tha isliye direct db se baat kar skte 
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if(existedUser){
        throw new apiError(409, "User with same username or email already exists")
    }


    // check for images, avatar as it is compulsory
    // pehle multer ka middleware kuch aur fields add karega req me aur multer me req.body ki jagah req.files karte 
    // req.files.path vo path hai jo multer ne humare local server pe store kiya hoga kaise to multer to middleware pe humne destination me humare ka public folder likha hai aur original name hi filename likhahai
    // console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path
    if(!avatarLocalPath) throw new apiError(400, "Avatar is required field")
        
    // const coverImageLocalPath = req.files?.coverImage[0]?.path
    // error aa rha tha isliye above line comment out kiya :  Cannot read properties of undefined (reading '0')
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }


    // upload them to cloudinary , avatar check
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar) throw new apiError(400, "Avatar is required field")


    // create user object - create entry in db
    // bs User baat karta db se to vohi create karega
    const user = await User.create({
        fullname,
        email, 
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })


    //  remove password and refresh token field from response, kyuki we dont want to send user this two fields
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    // yaha user ke liye _id automatically create hui hogi mongodb dwaara to uss user ko create kiya jiski id user._id hai 
    // aur usme se password aur refreshToken ki fields ko remove kiya, hence - (minus) password and fields separated by space


    // check for use creation - user sahi se pura ban gaya kya
    if(!createdUser){
        throw new apiError(500, "Something went wrong while registering the user")
    }


    // return response
    return res.status(201).json(
        new apiResponse(200, createdUser, "User Registered Successfully")
    )
})

export {registerUser}
