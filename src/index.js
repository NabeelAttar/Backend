// one line to remember : database is always in another continent, so jab bhi db wale kaam karo to try catch and async await lagao
import mongoose from "mongoose"
import { DB_NAME } from "./constants.js";

// jaise hi app load hoga humko database connect karna h
// iske 2 approaches h , 1: index me hi logic likhlo databse connection ka
// 2: db folder me function define karke export karo aur index me import karke execute karwa do - more professional appraoch 

// iffy functions of js: for faster execution, ';' for avoiding any errors if the previous line doesnt have any semi colon at the end

// import express from "express"
// const app = express()

// ;( async () => {
//     try {
//         await mongoose.connect(`${process.env.MONDODB_URI}/${DB_NAME}`)
//         app.on((error) => {
//             console.log("error: ", error)
//             throw error
//         })

//         app.listen(process.env.PORT, () => {
//             console.log(`app is listening on ${process.env.PORT}`)
//         })
//     } catch (error) {
//         console.error("error: ", error)
//         throw err
//     }
// })()

import connectDB from "./db/index.js";
import dotenv from 'dotenv'

dotenv.config({
    path: './env'
})
// ye app load hone se pehle hi dotenv file config hona zaruri hai, uske liye 2 syntax hai,  ya to require wala syntax ya ye, 
// require wala index.js ki ekdum fisrt line honi chahiye jaha import statements hoti jo code consistency kharab kardegi

// connectDB pe async await laga h , so promise return hoga , hence .then() likhe
connectDB()
.then(() => {
    // jb tk app.listen nhi karega app ka loading khatam nhi hoga, db connection, during loading wala process hai
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log("Mongo DB connection failed: ", error);
})