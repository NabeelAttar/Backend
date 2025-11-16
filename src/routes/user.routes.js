import { Router } from "express";
import {loginUser, logoutUser, refreshAccessToken, registerUser} from '../controllers/user.controller.js'
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

export default router