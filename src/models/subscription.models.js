import mongoose, {Schema} from "mongoose";
// users ke models me hi ek subscribers ka array daal skta tha na? alag se ek subscription model kyu banaya?
// kyuki millions subscribers bhi ho skte fir agar ek subscriber bhi unsubscribe kar jaaye to baaki sbko arrange karna aur aisehi 
// dusre operations heavy ho hoge boht 


const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
    // both subscriber and channel are users of the platform 
}, {timestamps: true})

export const Subscription = mongoose.model("Subscription", subscriptionSchema)