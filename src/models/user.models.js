//user id to automatically mongodb generate karega, bson data generate hota, json nhi
import mongoose, {Schema} from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true,
            index: true
            // searching ke liye index kaam aata, heavy operation hai isliye sirf username ke liye hi karneak
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, //cloudinary url
            required: true
        },
        coverImage: {
            type: String, //clodinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String, //install bcrypt or bcryptjs for hasing passwords 
            required: [true, "password is required"]
        },
        refreshToken: {
            type: String // install jwt
        }
    },
    {
        timestamps: true
        // yaha se createdAt and updatedAt mil jaayege
    }
)

// pre is a hook available jiski wajah se hum wajah se hum koi cheez karne se just pehle koi code run kar skte, type of middle ware 
// to yaha userSchema se user create hone se just pehle mai password encrypt karna chahta hu 
userSchema.pre("save", async function (next){
    // save type of operation hone se pehle ye run ho jaayega aur arrow function nhi h yaha kyuki uske ppass this wala context nhi hota
    if(!this.isModified("password")) return next(); //agar password already modify ho chuka hai fir bhi ye pre ki call aa rhi due to some other saving option to vo rokna hoga

    this.password = bcrypt.hash(this.password, 10); //bcrypt ne password ke liye hash generate kiya 10 rounds me
    next()
})

// ab user to apna clear text password hi likhega par vo encrypted se match karke verify karna hai
// designing custom methods- schema ke andar khudke methods bhi bana skte
userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password)
}

// jwt tokens generate karega sign method se, to uske liye bhi khudka method likhna padega, 
userSchema.methods.generateAccessTokens = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshTokens = function(){
    return jwt.sign(
        {
            _id: this._id,
            // kam data rakhte idhar
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)