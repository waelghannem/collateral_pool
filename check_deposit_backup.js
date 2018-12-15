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
function getrawtransactionOneOne(transactions, senders) {

    return new Promise(function (resolve, reject) {
    
       axios.get('https://explorer.hostmasternode.com/insight-api/tx/' + transactions.txid)
        .then(async (response) => {
	    //console.log("response from explorer is ",response)
	    console.log("address of the sender from explorer is ",response.data.vin[0].addr)
            resolve({ sender: response.data.vin[0].addr, receivedaddress: transactions.address, amount: transactions.amount })
        })
        .catch(error => {
            reject(error)
        });
    })
}
function getrawtransactionOne(res1) {
    return new Promise(function (resolve, reject) {
        bitcoin_rpc.call('getrawtransaction', [res1.result.vin[0].txid, res1.result.vin[0].vout], (err1, res1) => {
            if (err1) {
                reject(err1)
            }
            resolve({ sender: res1.result.vout[res1.result.vout.length - 1].scriptPubKey.addresses, receivedaddress: transactions.address, amount: transactions.amount })

        })
    })
}

function checkSender(hostname, rpc_port, rpc_user, rpc_password, request) {
    return new Promise(function (resolve, reject) {
        bitcoin_rpc.init(hostname, rpc_port, rpc_user, rpc_password)
        bitcoin_rpc.call('listtransactions', [], async (err, res) => {
            var senders = []
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
                for (transactions of res.result) {
		    console.log("enter in transactions list table and transaction category is: ",transactions.category)
                    if (transactions.category == "receive") {
                        try {
			    console.log("transactions.address receive category : ",transactions.address)
                            var result = await getrawtransactionOneOne(transactions)
                            senders.push(result)
                        } catch (error) {
                            console.log(error)
                        }

                    }
                }
                resolve(senders)
            }
        })
    })

}


function checkANdUpdatePromise() {
    return new Promise(function (resolve, reject) {
        var allSernders = []
        var pendingRequest = []
        DepositRequest.aggregate([
            { $unwind: "$status" },
            {
                $group: {
                    _id: { address: "$address", coin: "$coin" },
                    lastStatus: { $last: "$status.dateOfSubscription" },
                    count: { $sum: 1 },
                    allstatus: { $push: { status: "$status.status", dateofstatus: "$status.dateOfSubscription", amount: "$amount" } }
                }
            }])
            .exec(async function (err, data2) {
                if (err) {
                    reject(err)
                } else if (data2.length == 0) {
                    reject("no status find")
                } else {
                    for (request of data2) {
                        for (let i = 0; i < request.allstatus.length; i++) {

                            if (request.allstatus[i].status == "pending" && request.allstatus[i].dateofstatus.getTime() == request.lastStatus.getTime()) {
                                pendingRequest.push(request)
                                for (credentials of pool_params.COINS_CREDENTIALS) {
                                    if (credentials.name == request._id.coin) {
                                        try {
                                            tab = await checkSender(credentials.hostname, credentials.rpc_port, credentials.rpc_user, credentials.rpc_password, request)
                                            allSernders.push(tab)
                                        } catch (error) {
                                            reject(error)
                                        }
                                    }
                                }



                            }
                        }

                    }
                    resolve({ success: true, allSernders: allSernders, pendingRequest: pendingRequest })

                }
            })
    })
}
function updateStatus(pending, sender) {
    return new Promise(function (resolve, reject) {
        DepositRequest.findOne({ address: pending._id.address, coin: pending._id.coin }, function (err, data) {
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
                depositstatus.amount = sender.amount
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
function addParticipant(pending) {
    return new Promise(function (resolve, reject) {
        const newAddress = {
            owner: pending._id.address,
            address: pending._id.address
        }
        const participant = {
            address: newAddress,
            amount: pending.allstatus[pending.allstatus.length - 1].amount,
            type: pending._id.type
        }

        Coin.findOne({ name: pending._id.coin }, function (err, data) {

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
    
     try {
        updatesSenders = await checkANdUpdatePromise()
        console.log("this is the final senders table: ", updatesSenders)
        for (let pending of updatesSenders.pendingRequest) {
            const addr = pending._id.address
            console.log("allsenders = ", updatesSenders.allSernders)                                        
                        for (let sender of updatesSenders.allSernders) {
			    console.log("sender are ",sender)
                            if (sender != undefined) {
                                for (senderitem in sender) {
                                    
                                    if (pending._id.address == sender[senderitem].sender && pending.allstatus[pending.allstatus.length - 1].amount <= sender[senderitem].amount) {
                                      console.log("pending._id.address == sender[senderitem].sender[0] ",pending._id.address," == ",sender[senderitem].sender)

                                        try {
                                            const resultofupdatesstatus = await updateStatus(pending, sender[senderitem])
                                            try {
                                                const resultOfAddingParticipant = await addParticipant(pending)
                                            } catch (error) {
                                                console.log(error)
                                            }
                                            //console.log("request need to be modified : ",resultofupdatesstatus)
                                        } catch (error) {
                                            console.log(error)
                                        }


                                    }

                                }
                            }

                        }

        }

    } catch (error) {
        console.log(error)
    } 
    console.log('checkANdUpdate running a task every minute');
  });
module.exports = async function checkANdUpdate() {
    console.log("checkANdUpdate task bech tranni")
    //tasks.start();
   // tasks.destroy();
}
