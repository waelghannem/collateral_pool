
const RewardSchema = require('./models/rewards');
const exec = require('child_process').exec;
var cron = require('node-cron');
const Coin = require('./models/coin')



function showListTransactions(fileshowtransaction, coin_cli) {
    return new Promise(function (resolve, reject) {
        exec(`sh ${fileshowtransaction} ${coin_cli}`, (err, stdout, stderr) => {
            if (err) {
                reject(err)
            } else if (stderr) {
                reject(stderr)
            } else {
                if (stdout) {
                    resolve(stdout)
                } else {
                    reject("no transactions founded")
                }
            }
        });
    })
}

function sendTransactions(sendFile,coin_cli, sendString) {
    return new Promise(async (resolve, reject) => {
        await exec(`sh ${sendFile}  ${coin_cli} ${sendString}`, (err, stdout, stderr) => {
            if (!err) {
                resolve({ "stdout": stdout.toString(), "stderr": stderr.toString() })
            } else {
                reject(err)
            }
        });
    })
}


function searchReward(txid) {
    return new Promise(async (resolve, reject) => {
        await RewardSchema.findOne({ txid: txid }, async function (err, data) {
            if (err) reject(err)
            if (data) {
                if (data["status"] != "pending") {
                    resolve("pending")
                } else {
                    resolve("completed")
                }

            } else {
                resolve("new reward")
            }
        });
    })
}


function saveAddressPayed(payedAddressesInput) {
    return new Promise(async (resolve, reject) => {
        await payedAddressesInput.save((err) => {
            if (err) {
                reject(err)
            }
            resolve("Address payed saved with success")
        })
    })
}

function updateReward(id, rewardrecord) {
    return new Promise(async (resolve, reject) => {
        await RewardSchema.update({ txid: id }, { $set: rewardrecord }, function (err, updatedReward) {
            if (err) reject(err);
            resolve("reward updated with success")
        });
    })
}


function saveReward(reward) {
    return new Promise(async (resolve, reject) => {
        await RewardSchema.findOne({ txid: reward.txid }, (err, data) => {
            if (err) reject(err)
            if (data) {
                reject("reward already saved in db")
            }
            else {
                reward.save((err) => {
                    if (err) {
                        reject(err)
                    }
                    resolve("reward saved successfully")
                })
            }


        })


    })
}

function forwardReward(newTxid, totalAmount, tx, masternode, coin_cli, fee) {
    console.log("newTxid ",newTxid)
    console.log("totalAmount ",totalAmount)
    console.log("coin_cli ",coin_cli)
    console.log("fee ",fee)
    return new Promise(async (resolve, reject) => {
        var transactionsSendBegin = "'{"
        var transactionsSendEnd = "}'"
        var content = ""
        var content2 = ""
        var sendString = ""
        var totalPercentage = 0;
        if (masternode.members.length != 0) {
            for (let index = 0; index < masternode.members.length; index++) {
                totalPercentage += masternode.members[index]["percentage"]
            }
            if (totalPercentage <= 100 && totalPercentage > 0) {
                for (let index = 0; index < masternode.members.length; index++) {
                    var amoutPerAddress1 = masternode.members[index]["percentage"] * totalAmount / 100 
                    var amoutPerAddress = amoutPerAddress1.toFixed(8)
                    console.log("amoutPerAddress is ",amoutPerAddress)
                    var address = masternode.members[index]["address"]
                    var percentage = masternode.members[index]["percentage"]
                    console.log("percentage is ",percentage)
                    content += `"""${address}""":${amoutPerAddress},`
                    content2 += `"${address}":${amoutPerAddress},`

                    sendString = transactionsSendBegin + content2.substring(0, content2.length - 1) + transactionsSendEnd
                }
                try {
                    var result = await sendTransactions("forward_reward.sh",coin_cli, sendString)
                    try {
                        var saveAddresses = await saveAddressPayed(addressPayed)
                        const rewardRecord = new RewardSchema({
                            address: tx["address"],
                            txid: tx["txid"],
                            forwarded_txid: result.stdout.toString(),
                            masternode_name: masternode.name,
                            status: "complete"
                        })
                        if (newTxid == true) {
                            try {
                                var savedReward = await saveReward(rewardRecord)
                                resolve(savedReward)
                            } catch (error) {
                                reject(error)
                            }
                        }
                        else {
                            try {
                                var updatedRewardfunc = await updateReward(tx["txid"], rewardRecord)
                                resolve(updatedRewardfunc)
                            } catch (error) {
                                reject(error)
                            }

                        }



                    } catch (error) {
                        reject(error)
                    }


                } catch (error) {
                    reject(error)
                }


            } else if (totalPercentage > 100) {
                reject("total percentage is higher than 100 %")
            } else {
                reject("total percentage should be more than 0 %")
            }
        } else {
            reject("no members of masternode ", masternode.name, " founded")
        }



    })


}

var task = cron.schedule('*/4 * * * *', async () => {
    console.log("reward dist run every 4 mins")
    Coin.aggregate([
        { $project: { masternodes: 1, name: 1, collateral: 1, category: 1, fee: 1 } }
    ]).exec(async function (err, coinsWithMasternodes) {
        if (err) console.log(err)
        if (coinsWithMasternodes) {
            console.log(coinsWithMasternodes)
            for (let coinWithMasternodes of coinsWithMasternodes) {
                if (coinWithMasternodes.masternodes.length > 0) {
                    for (let masternode of coinWithMasternodes.masternodes) {
                        try {
                            var coin_cli = coinWithMasternodes.name + "_cli"
                            var coin_script_file = coinWithMasternodes.name + "_showListTransactions.sh"
                            var listtransactions = await showListTransactions(coin_script_file, coin_cli)
                            console.log("listtransactions length : ",listtransactions.length)
                            var listtransactionsjson = JSON.parse(listtransactions)
                            //console.log("listtransactions  : ",listtransactions)
                            for (let index = 0; index < listtransactionsjson.length; index++) {
                                const transaction = listtransactionsjson[index];
                                console.log("transaction ", transaction)
                                var totalAmount = transaction["amount"]
                                if (transaction["category"] != coinWithMasternodes.category) {
                                    //console.log("not generate transaction ", transaction["category"], " ", coinWithMasternodes.category)
                                    continue;
                                }
                                const txid = transaction["txid"]
                                const address = transaction["address"]
                                if (address != masternode.address) {
                                    console.log("not the address of the masternoide ",masternode.address, " ",address)
                                    continue;
                                }
                                try {
                                    var search = await searchReward(txid)
                                    console.log("saerch res : ",search)
                                    if (search == "pending") {
                                        try {
                                            var forward = await forwardReward(false, totalAmount, transaction, masternode, coin_cli, coinWithMasternodes.fee)
                                            console.log("forward res : ",forward)
                                        } catch (error) {
                                            console.log(error)
                                        }
                                    } else if (search == "new reward") {
                                        try {
                                            var forward = await forwardReward(true, totalAmount, transaction, masternode, coin_cli)
                                            console.log("forward res2 : ",forward)
                                        } catch (error) {
                                            console.log(error)
                                        }
                                    }
                                } catch (error) {
                                    console.log(error)
                                }
                            }

                        } catch (error) {
                            console.log(error)
                        }
                    }


                }
            }
        }
    })
})


