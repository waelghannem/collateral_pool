const mongoose = require('mongoose')



const AddressSchema = mongoose.Schema({
    address : {
        type : String,
        required : true
    },
    owner : {
        type : String,
        required : true
    },
    dateOfSubscription : {
        type: Date, default: Date.now()
    }
})

const Address = module.exports = mongoose.model('Address',AddressSchema)



