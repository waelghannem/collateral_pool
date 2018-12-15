const mongoose = require('mongoose')
const bitcoin_rpc = require('node-bitcoin-rpc')
var cron = require('node-cron');
const config = require('./config/database')
const Coin = require('./models/coin')
const pool_params = require('./config/pool_params')
const exec = require('child_process').exec;
const createMasternode = require('./testapi')

mongoose.connection.on('connected', () => {
    console.log("connected to database : ", config.databse)
})

mongoose.connection.on('error', (err) => {
    console.log("database error : ", err)
})

function create_masternode_Promise(credentials) {
    return new Promise(function (resolve, reject) {
        exec(`sh ${credentials.CREATE_MASTERNODE_FILE}`, (err, stdout, stderr) => {
            if (!err) {
                resolve(stdout)

            } else {
                reject(err)
            }
        });
    })
}

function getbalance(file,cmd) {
    console.log("try get balance ")
        return new Promise(function (resolve, reject) {
            exec(`sh ${file} ${cmd}`, (err, stdout, stderr) => {
                if (err) {
                    reject(err)
                } else if (stderr) {
                    reject(stderr)
                } else {
                    if (stdout) {
                        resolve(stdout)
                    } else {
                        reject("restart_server_file error")
                    }
                }
            });
        })

}


function findAndUpdate(masternode, coin) {

    return new Promise(function (resolve, reject) {

        Coin.findOne({ name: coin.name }, function (err, coinsaved) {

            if (err) {

                reject({ success: false, msg: err })

            } else {

                if (!coinsaved) {

                    reject({ success: false, msg: "no coin founded" })

                } else {

                    coinsaved.masternodes.push(masternode)

                    coinsaved.save(function (err2, saved2) {

                        if (err) reject({ success: false, msg: err })

                        resolve({ success: true, newcoin: saved2 })

                    })

                }

            }

        })

    })

}
/* function getbalance(credentials) {
    console.log("try get balance ")
    return new Promise(function (resolve, reject) {
        bitcoin_rpc.init(credentials.hostname, credentials.rpc_port, credentials.rpc_user, credentials.rpc_password)
        bitcoin_rpc.call('getbalance', [], async (err, res) => {
            console.log("in getbalance ", err, res )
            if (err !== null) {
                reject(err)
            }
            else if (res.error) {
                reject(res.error)
            }
            else {
                resolve(res)
            }
        })
    })
} */

var task = cron.schedule('*/6 * * * *', async () => {
    console.log("this task is running every 10 mins")

    console.log("create_masternodes tasks")
    Coin.aggregate([
        { $project: { name: "$name", participants: "$participants", collateral: "$collateral", masternodes: "$masternodes" } }
    ]).exec(async function (err, data2) {
        if (err) {
            console.log(err)
        } else if (data2.length == 0) {
            console.log("no coins find")
        } else {
            for (let i = 0; i < data2.length; i++) {
                for (credentials of pool_params.COINS_CREDENTIALS) {
                    console.log(credentials.name, " == ", data2[i].name)
                    if (credentials.name == data2[i].name) {
                        try {
                            //var balance = await getbalance(credentials)
                            var balanceres = await getbalance("getbalance.sh","hostmasternode-cli")
                            var balance = Number(balanceres)
                            console.log("balance = ", balance)
                            excpected_masternodes_number = Math.floor(balance / data2[i].collateral)
                            // console.log("data2[i] = ",data2[i])
                            // check number of masternodes created and balance 
                            console.log("data2[i].masternodes.length = ", data2[i].masternodes.length)
                            console.log("excpected_masternodes_number = ", excpected_masternodes_number)
                            if (excpected_masternodes_number > data2[i].masternodes.length) {
                                console.log("we need to create other masternodes")
                                number_masternode_must_be_created = excpected_masternodes_number - data2[i].masternodes.length
                               // for (let j = 0; j <= number_masternode_must_be_created; j++) {
                                    try {
                                        result_create_msternode = await createMasternode.createMasternode()
                                        let collateral_collect = 0;
                                        let collateral_collect_members = [];
                                        

                                        if (data2[i].participants.length > 0) {
                                        for (let index = 0; index < data2[i].participants.length; i++) {
                                            if (collateral_collect < data2[i].collateral) {
                                                collateral_collect += data2[i].participants[index].amount;
                                                var collateral_percentage = data2[i].collateral / data2[i].participants[index].amount
                                                collateral_collect_members.push({
                                                    name: data2[i].participants[index].address.owner,
                                                    address: data2[i].participants[index].address.address,
                                                    percentage: collateral_percentage
                                                })
                                            }
                                        }
                                    }
                                    const masternode = {
                                        name: result_create_msternode.masternode_name,
                                        address : result_create_msternode.masternode_address,
                                        members: collateral_collect_members,
                                        status: "enabled"
                                    }
                                       
                                        try {

                                            var resultofaddingmn = await findAndUpdate(masternode, data2[i])

                                            console.log(resultofaddingmn)

                                        } catch (error) {

                                            console.log(error)

                                        }

                                    } catch (error) {
                                        console.log(error)
                                    }
                               // }
                            } else {
                                console.log("masternodes are equal to expected masternodes's number")
                            }

                        } catch (error) {
                            console.log(error)
                        }
                    }
                }
            }
        }
    })

});

module.exports = function create_masternodes() {

}
