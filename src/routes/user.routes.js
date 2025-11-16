import { Router } from "express";
import {getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser} from '../controllers/user.controller.js'
import { upload } from "../middlewares/multer.middleware.js";
// agar export default naa likha ho jaaha se export karre waha to {} ke andar import karte 
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

// app.js ki userRouter call se control yaha pe aaya ab yaha route define karega router
// multer ka upload object import karlo, aur vo middleware hai to hum chahte ki registerUser function chalne pehle ye chale 
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]), 
    registerUser
)

router.route("/login").post(loginUser)

// secured routes - mtlb inn routes me jaane user logged in hona chahiye
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateCoverImage)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile) //yaha data url se aayega hence url me /channel/username 
router.route("/history").get(verifyJWT, getWatchHistory)


export default router