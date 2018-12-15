const config = require('./config/database')
const User = require('./models/user')
const Coin = require('./models/coin')
const mongoose = require('mongoose')
const bitcoin_rpc = require('node-bitcoin-rpc')
const pool_params = require('./config/pool_params')
const DepositRequest = require('./models/deposit_request')
const DepositStatus = require('./models/deposit_status')
const axios = require('axios');
var cron2 = require('node-cron');

mongoose.connection.on('connected', () => {
    console.log("connected to database : ", config.databse)
})

mongoose.connection.on('error', (err) => {
    console.log("database error : ", err)
})

function checkSender(hostname, rpc_port, rpc_user, rpc_password,deposit_address,amount) {
    return new Promise(function (resolve, reject) {
        bitcoin_rpc.init(hostname, rpc_port, rpc_user, rpc_password)
        bitcoin_rpc.call('listtransactions', [], async (err, res) => {
            if (err !== null) {
		console.log("error from listtransactions ", err)
                reject(err)
            }
            else if (res.error) {
		console.log("error from listtransacions res.error ",res.error)
                reject(res.error)
            }
            else {
        //console.log("there is no error from listttransactions ",res)
                var reqstat;
                for (transactions of res.result) {
                    if (transactions.category == "receive") {
			console.log("enter in transactions list table and transaction category is: ",transactions.category)
                        console.log("transactions.address = ",transactions.address)
                        console.log("deposit_address = ",deposit_address)

                        console.log("transactions.amount = ",transactions.amount)

                        console.log("amount = ",amount)
                        if(transactions.address == deposit_address && transactions.amount == amount){
                            reqstat = {requeststatus : "completed"}
                        }

                    }
                }
                resolve(reqstat)
            }
        })
    })

}

function updateStatus(addresspercoin,coin) {
    return new Promise(function (resolve, reject) {
        DepositRequest.findOne({ deposit_address: addresspercoin.deposit_address, coin: coin }, function (err, data) {
            if (err) {
                console.log("err ", err)
                reject({ success: false, message: err });
            } else if (!data) {
                console.log("no field ", data)
                reject({ success: false, message: "no field " });
            } else {
                const depositstatus = new DepositStatus({
                    status: "complete",
                    dateOfSubscription: Date.now()
                })
                depositstatus.amount = addresspercoin.allstatus[addresspercoin.allstatus.length - 1].amount
                data.status.push(depositstatus)
                const latestdate = new Date(Math.max.apply(null, data.status.map(function (e) {
                    return new Date(e.dateOfSubscription);
                })));
                //console.log("latest date of neweest status is ", latestdate)
                data.save((err,doc)=>{
        if(err) resolve({success:false,error:err});
        resolve({
            success:true,
            user:doc
        })
    })
                resolve(data)

            }
        });
    })
}
function addParticipant(addresspercoin,coin) {
    return new Promise(function (resolve, reject) {
        const newAddress = {
            owner: addresspercoin.user,
            address: addresspercoin.address
        }
        const participant = {
            address: newAddress,
            amount: addresspercoin.allstatus[addresspercoin.allstatus.length - 1].amount,
            type: "wallet"
        }

        Coin.findOne({ name: coin }, function (err, data) {

            if (err) {
                console.log("err ", err)
                reject({ success: false, message: err });
            } else if (!data) {
                console.log("no field ", data)
                reject({ success: false, message: "no field " });
            } else {
                data.participants.push(participant)
                data.save((err, user) => {
                    if (err) {
                        console.log('failed to add coin ', err)
                        reject({ success: false, msg: 'failed to add coin ', err })
                    } else {
                        console.log('coin added')
                        resolve({ success: true, msg: 'coin added' })
                    }
                }
                )
            }
        });
    })
}
 var tasks = cron2.schedule('* * * * *', async() => {
    
     
    DepositRequest.aggregate([
        { $unwind: "$status" },
        {
            $group: {
                _id: { user : "$user" ,address: "$address", coin: "$coin", deposit_address:"$deposit_address" },
                lastStatus: { $last: "$status.dateOfSubscription" },
                count: { $sum: 1 },
                allstatus: { $push: { status: "$status.status", dateofstatus: "$status.dateOfSubscription", amount: "$amount" } }
            }
            
        },
        {
            $group : {
                _id : "$_id.coin",
                alladdresses : { 
                    $push : {
                        user : "$_id.user",
                        address : "$_id.address",
                        deposit_address : "$_id.deposit_address",
                        allstatus: "$allstatus", 
                        lastStatus: "$lastStatus"
                        }
                    }
                }
            }])
        .exec(async function (err, data2) {
            if (err) {
               console.log(err)
            } else if (data2.length == 0) {
                console.log("no status find")
            } else {
                for (request of data2) { // 1 fois
                    for (addresspercoin of request.alladdresses){ // 2 fois
                            if (addresspercoin.allstatus[addresspercoin.allstatus.length - 1 ].status == "pending" && addresspercoin.allstatus[addresspercoin.allstatus.length - 1 ].dateofstatus.getTime() == addresspercoin.lastStatus.getTime()) {
                                for (credentials of pool_params.COINS_CREDENTIALS) { // 1 fois
                                    if (credentials.name == request._id) {
                                        try {
                                            tab = await checkSender(credentials.hostname, credentials.rpc_port, credentials.rpc_user, credentials.rpc_password,addresspercoin.deposit_address,addresspercoin.allstatus[addresspercoin.allstatus.length - 1].amount)
                                            console.log(tab);
					    if(tab){
                                            if(tab.requeststatus == "completed"){
                                                try {
                                                    const updateRequestStatus = await updateStatus(addresspercoin,request._id)
                                                        try {
                                                            const addParticipantToCoin = await addParticipant(addresspercoin,request._id)
                                                        } catch (error) {
                                                            console.log(error)
                                                            continue                                                            }
                                                    

                                                } catch (error) {
                                                    console.log(error)
                                                                                                        }
                                            }}
                                        } catch (error) {
                                            console.log(error)
                                            continue
                                        }
                                    }
                                }
                            }
                     
                    }
                    
                    

                }
            }
        })

    console.log('checkANdUpdate running a task every minute');
  });
module.exports = async function checkANdUpdate() {
    console.log("checkANdUpdate task bech tranni")
    //tasks.start();
   // tasks.destroy();
}

