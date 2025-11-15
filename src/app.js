import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// data backend me boht jagah se aayega - url se, form se , json se, unki preparation chal rhi,
app.use(express.json({limit: "16kb"}))
// json data max 16 aa skka kyuki server crash karnese bachana hai
// ab url se data lene ke liye
app.use(express.urlencoded({limit: "16kb", extended: true}))
// extended true se nested objects url me define kar stke
app.use(express.static("public"))
// kuch data jaise images, fevicon n all store karne ke liye folder
// lastly - cookie parser, cookie hota hai browser me stored user ka data, usse related operations karne ye karo
app.use(cookieParser())


// routes import
import userRouter from "./routes/user.routes.js"

// routes declaration
// app,get nhi app.use , use hoga kyuki app.get tab use hota jab yahi pe controller aur yahi pe router hota , ab jab cheeze segregated ho 
// gyi hai to middleware use karna padega hence wewill use app.use
app.use("/api/v1/users", userRouter)
// ab yaha se control jaayeag userRouter pe 
// so for registering user the url is : http://localhost:8000/api/v1/users/register
// /api/v1/users is defined here and /register is defined is in the userRouter


export { app }

// jsb koi middleware ya configurations use karte to app.use lagega CORS origin ke liye aur app,get ya app,post to normally hota hi hai