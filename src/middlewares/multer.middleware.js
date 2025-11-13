// file upload karte hue middleware -> bihcki functionaity
import multer from 'multer'

// middleware kaise use karte main jagah -> function (pehle kya karna hai vo func, middleware, baadme kya karna hai vo func) aise hota generally

const storage = multer.diskStorage({
    // diskstorage aur memory storage do options hote hum diskstorage use karege kyuki badi files me memorystorage overflow ki problem aati
    destination: function (req, file, cb){
        cb(null, './public/temp')
        // req to json data ki kya karna hai create, delete wagere, file konsi ke sath kya karna hai, cb = callback normal wala, cb(null) -> null error ke liye
    },
    filename: function (req, file, cb){
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        // // chhote time ke liye rahega isliye suffix nhi bhi generate kiya to chalega
        // cb(null, file.filename + '-' + uniqueSuffix)
        cb(null, file.originalname)
    }
})
// ye hui middleware ki configuration
export const upload = multer({storage: storage})