// javascript error class provide karta errors ko handle karne ke liye , apan apni class likhege jo error class se inherited hogi
class apiError extends Error {
    constructor(
        statusCode,
        message= "Something went wrong",
        errors = [],
        stack = ""
    ){
        // override yaha karege
        this.statusCode = statusCode
        super(message) //isko override karna zaruri kyuki vo msg sometin wrnt wrong accha nhi
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors    

        if(stack){
            this.stack = stack
        }
        else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

// ab saare errors ka format ek kardiya hai, aasani se error handle hoga

export {apiError}