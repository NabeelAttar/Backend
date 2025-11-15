class apiResponse {
    constructor(statusCode, data, message = "Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
        // 400 se upar error ke status codes hote, aur 399 tk response ke status codes
    }
}

export {apiResponse}