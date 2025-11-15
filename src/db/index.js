import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        // console.log(connectionInstance) //ek baar iska output dekhna
        console.log(`Connection with database was successful. DB host : ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("error in connecting db", error)
        process.exit(1)
        // node offers process method which is accessible anywhere in the whole folder. it refers to the current process which is begin carrried out, here connecting db
    }
}

export default connectDB