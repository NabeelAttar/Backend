import { Router } from "express";
import {registerUser} from '../controllers/user.controller.js'
import { upload } from "../middlewares/multer.middleware.js";
// agar export default naa likha ho jaaha se export karre waha to {} ke andar import karte 
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
  
export default router