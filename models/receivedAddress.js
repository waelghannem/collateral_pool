const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const receivedAddressSchema = new Schema({
    address: {type:String, required: true},
    fee : {type: Number, default:0},
    userId : {type: String, required:true}
   });

   module.exports = mongoose.model('ReceivedAddressSchema', receivedAddressSchema);
