const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const rewardSchema = new Schema({
    dateOfReward : {type: Date, default: Date.now()},
    address: {type:String},
    txid : {type:String, default:"empty"},
    status : {type: String, default:"pending"},
    forward_txid : { type : String, required:true},
    masternode_name : {type : String, required : true}
   });

   module.exports = mongoose.model('RewardSchema', rewardSchema);
