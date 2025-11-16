import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from '../models/user.models.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { apiResponse } from "../utils/apiResponse.js"
import jwt from 'jsonwebtoken'

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessTokens()
        const refreshToken = user.generateRefreshTokens()

        // refresh token ko databse me store karao for comparison later
        user.refreshToken = refreshToken
        // tokens generate ho gye hai user to mongoose method save se save karo, by default save method ko password validated lagta hai isliye
        // hum explicitly bole ki bina password validation ke save kardo
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new apiError(500, "Something went wrong while generating access and refresh tokens")
    }
}

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


// access token aur refresh token dono same hi tarah se generate hote bs ek short lived hota aur dusra loong lived. so,  agar login karrhe 
// to access token milega aur user login hai agar and authenticated hai to file uploading wagere kar skta , lekin agar login nhi karta
// and for security reasons login window bs 15 min hi chalti fir user ko firse password wagere daalne ki zarurat nhi hum kehte ki aap bs
// ek endpoint hit kar dijiye aur refresh token generate ho jaayega agar ye generate hua hua refresh token aur database ka token match ho gye
// to hum aaap ko login karwa dege

const loginUser = asyncHandler(async (req, res) => {
    // req body se data lo
    const {email, username, password} = req.body


    // username ya email hona chahiye 
    if(!username && !email){
        throw new apiError(400, "username or email is required")
    }


    // find the user with same username or same email
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    // agar nhi mila to user doesnt exist
    if(!user) throw new apiError(404, "User does not exist")


    // agar mil gaya to password check karo sahi daala kya 
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid) throw new apiError(401, "Invalid user credentials")
    
    // access and refresh token
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)


    // remove password and refresh token fields 
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")


    // send cookie with response
    // cookies jo hai direct bhejega tofrontend se koi bhi modify kardega, hum chahte ki sirf sever se modify ho, hence below step
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200) 
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new apiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User Logged In Successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req, res) => {
    // cookie hatana padega, refresh token database me reset karna hoga 
    // ab middleware ki wajah se yaha req field me user available hoga
    // hum findbyIdAndUpdate and se pehle find karege fir uska refreshToken humare database se uda dege aur new value jaise bhejna hai usko true kardege
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User logged Out"))

})

// vo endpoint banate jisko agar user hit karega (frontend developer hit karwayega) to refresh token generate hoga aur user login ho jaayega
// uske liye pehle controller banayege ofc
const refreshAccessToken = asyncHandler(async (req, res) => {
    // cookie se refresh token lega
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken) throw new apiError(401, "unauthorized request")

    try {
        // refresh token ko decode karega usme se id nikaalne ke liye jiske basis me user dhund skta 
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)
        if(!user) throw new apiError(401, "Invalid Refresh Token")
        
        // ye token aur database me jo user ke liye token store hua tha vo agar same nhi h to throw error
        if(incomingRefreshToken !== user.refreshToken){
            throw new apiError(401, "Refresh token is expired or used")
        }
        
        const options = {
            httpOnly: true,
            secure: true
        }

        // agar dono token match kar jaate to user ko login karwa dege bina password daale , mtlb naya session generate hoga mtlb firse 
        // access and refresh tokens generate hoge
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)

        // return these naye tokens in the response
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new apiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access Token refreshed"
            )
        )
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid Refresh Token")
    }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}
