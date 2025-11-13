// backend me database se boht baar baat karna padta, baat baat pe data lena padta aur database se baat karne do cheex karni padti:
// async await lagana kyuki data aane timelagega and try catch block , to baar baar ye likhne se acha hum wrapper method banayege 
// ye wrapper method ya to async await se bana skte ya promise .then() se

// async await method
// const asyncHandler = (func) = async (req, res, next) => {
//     // func is the function jo input me aayega jiske upar ye wrapper method lagana hai, aur req, res to pata hi hai fir next ek flag hota bas
//     // jo current kaam ho gya to 1 ho jaata, ye darshane ki ab next task pe move kar skte
//     try {
//         await func(req, res, next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }

// promise wala tareeka
const asyncHandler = (func) => {
    (req, res, next) => {
        Promise.resolve(func(req, res, next)).catch((err) => next(err))
        // js se hum sikhe ki promise ka reject and resolve hota, humne reject ki jagah catch kar liya
    }
}

export { asyncHandler }