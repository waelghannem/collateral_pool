const pool_params = require('./config/pool_params')
const exec = require('child_process').exec;
const bitcoin_rpc = require('node-bitcoin-rpc')
const fs = require('fs')
const readLastLines = require('read-last-lines');
const axios = require('axios');
const getFreeOutputs = require('./free_outputs')

const credentials = {
    rpcuser: "wael",
    rpcpassword: "wael",
    CREATE_MASTERNODE_FILE: "HMN_coin.sh",
    rootDirectory: "/root/.hostmasternodecore"
}
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




function readMnFromFile() {
    return new Promise(function (resolve, reject) {
        exec(`sh "getLastLine.sh"`, (err, stdout, stderr) => {
            if (!err) {
                resolve(stdout)

            } else {
                reject(err)
            }
        });
    });

}

function writeToFile(a) {
    return new Promise(function (resolve, reject) {
        const data = new Uint8Array(Buffer.from(a));
        fs.writeFile('newmn.txt', data, (err) => {
            if (err) reject(err);
            resolve('The file has been saved!');
        });
    })
}


function addNewMn(root, filename, ligne) {
    return new Promise(function (resolve, reject) {
        const data = new Uint8Array(Buffer.from(ligne));
        fs.appendFile(`${root}/${filename}`, ligne, (err) => {
            if (err) reject(err);
            resolve('The file has been saved!');
        });
    })
}

function start_deamon(filename, deamon_name) {
    return new Promise(function (resolve, reject) {
        exec(`sh ${filename} ${deamon_name}`, (err, stdout, stderr) => {
            if (stdout) {
                console.log("deamon started ", stdout)
                resolve(stdout)
            } else {
                console.log("deamon NOT started ", stderr, "and error is ", err)
                reject(err, stderr)
            }
        })
    })
}

function kill_deamon(namefile, name) {
    return new Promise(function (resolve, reject) {
        exec(`sh ${namefile} ${name}`, (err, stdout, stderr) => {
            if (!err) {
                resolve(stdout)

            } else {
                reject(err)
            }
        });

    })
}

function get_mn_outputs(mn_cli_file) {
    return new Promise(function (resolve, reject) {
        exec(`sh get_mn_outputs.sh ${mn_cli_file}`, (err, stdout, stderr) => {
            if (!err) {
                resolve(stdout)

            } else {
                if (err) {
                    reject(err)
                } else {
                    reject(stderr)
                }
            }
        });
    })
}

function get_block_count(mn_cli_file) {
    return new Promise(function (resolve, reject) {
        exec(`sh get_block_count.sh ${mn_cli_file}`, (err, stdout, stderr) => {
            if (err) {
                reject(err)
            } else if (stderr) {
                reject(stderr)
            } else {
                if (stdout) {
                    resolve(stdout)
                } else {
                    reject("no blocks founded")
                }
            }
        });
    })
}

function add_sync_block(sync_block_script_file, block_file) {
    return new Promise(function (resolve, reject) {
        exec(`sh ${sync_block_script_file} ${block_file}`, (err, stdout, stderr) => {
            if (err) {
                reject(err)
            } else if (stderr) {
                reject(stderr)
            } else {
                if (stdout) {
                    resolve(stdout)
                } else {
                    reject("add_sync_block no blocks founded")
                }
            }
        });
    })
}

function restart_server(restart_server_script_file, restart_server_cli, restart_serverd) {
    console.log("start restarting server", restart_server_cli, restart_serverd)
    return new Promise(function (resolve, reject) {
        exec(`sh ${restart_server_script_file} ${restart_server_cli} ${restart_serverd}`, (err, stdout, stderr) => {
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


function masternode_start(masternode_start_script_file, masternode_start_cli, mnalias) {
    return new Promise(function (resolve, reject) {
        exec(`sh ${masternode_start_script_file} ${masternode_start_cli} ${mnalias}`, (err, stdout, stderr) => {
            if (err) {
                reject(err)
            } else if (stderr) {
                reject(stderr)
            } else {
                if (stdout) {
                    resolve(stdout)
                } else {
                    reject("masternode_start_file error")
                }
            }
        });
    })
}


function getTransactionInfo(txinfo_script_file, txinfo_cli, txid) {
    return new Promise(function (resolve, reject) {
        exec(`sh ${txinfo_script_file} ${txinfo_cli} ${txid}`, (err, stdout, stderr) => {
            if (err) {
                reject(err)
            } else if (stderr) {
                reject(stderr)
            } else {
                if (stdout) {
                    resolve(stdout)
                } else {
                    reject("tx info error")
                }
            }
        });
    })
}


module.exports.createMasternode = async function () {
    try {
        var processkilled = await kill_deamon("kill_hmn.sh", "hostmasternoded")
        try {
            var result = await create_masternode_Promise(credentials)
            console.log("create_masternode_Promise ",create_masternode_Promise)
            var res = result.toString()
            try {
                var newmn = await writeToFile(res)

                console.log("newmn ",newmn)
                try {
                    var readLine = await readMnFromFile()
                    console.log("readLine ",readLine)

             /*        const explorer_url = "https://explorer.hostmasternode.com/insight-api/blocks?limit=1"
                    axios.get(`${explorer_url}`)
                        .then(async (response) => {
                            console.log("data from explorer ", response.data.blocks[0].height);
                            console.log("type of data from explorer ", typeof (response.data.blocks[0].height));
                            let block_count = 0
                            let explorer_block = response.data.blocks[0].height
                            console.log("initial blockcout ", block_count) */
                            try {
                                var res = await add_sync_block('add_sync_block.sh', 'blocks')
                                console.log("add_sync_block ",add_sync_block)

                                try {
                                    var serverrestarted = await restart_server('restart_server.sh', 'hostmasternode-cli', 'hostmasternoded')
                                    console.log("serverrestarted ",serverrestarted)
                                    console.log("-----------------------------------------")
                                    console.log("-----------------------------------------")
                                    console.log("-----------------------------------------")
                                    console.log("-----------------------------------------")
                                    console.log("server started ", serverrestarted)
                                    console.log("-----------------------------------------")
                                    console.log("-----------------------------------------")
                                    console.log("-----------------------------------------")
                                    console.log("-----------------------------------------")
                                    /* while (block_count < explorer_block) {
                                       console.log(block_count, " < ",explorer_block)
                                       try {
                                           block_count = await get_block_count('hostmasternode-cli')
                                           console.log("block_count ", block_count)
                                       } catch (error) {
                                           console.log(error)
                                       }
                               }   */
                                    /*     let i = 0;
                                        async function f1(block_countloc,explorer_blockloc) { 
                                            console.log(block_countloc, " < ",explorer_blockloc)
                                            try {
                                                block_count = await get_block_count('hostmasternode-cli')
                                                console.log("block_count ", block_count)
                                            } catch (error) {
                                                console.log(error)
                                            }
                                         };   
                                        async function f() {
                                            await f1(block_count,explorer_block);
                                            i += 1;
                                            var tmout = setTimeout(async() => {
                                                if(i < 5 && (block_count < explorer_block)) {
                                                    f();
                                                }else {
                                                    clearTimeout(tmout)
                                                }
                                            }, 1000);
                                        }
                                        var test = await f(); */
                                    /*                             if (Number(block_count) == Number(response.data.blocks[0].height)) {
                                     */                               // console.log("true condition")
                                    // var outputs = await get_mn_outputs('hostmasternode-cli')
                                    // console.log("outputs are ", outputs)
                                    // call get free outputs module (newjs.js)
                                    try {
                                        var freeOutputs = await getFreeOutputs.getFreeOutputs();
                                        console.log("-----------------------------------------")
                                        console.log("-----------------------------------------")
                                        console.log(freeOutputs)
                                        console.log("-----------------------------------------")
                                        console.log("-----------------------------------------")
                                    } catch (error) {
                                        console.log(error)
                                    }
                                    if (freeOutputs) {
                                        try {
                                            var newLine = "masternode" + freeOutputs.indexInMongodb + " " + readLine.replace(/(\r\n\t|\n|\r\t)/gm, "") + " " + freeOutputs.txid + " " + freeOutputs.index + "\n"
                                            var mnAdded = await addNewMn(credentials.rootDirectory, "masternode.conf", newLine)
                                            console.log("mnAdded ",mnAdded)


                                            try {
                                                /*  var processkilled = await kill_deamon("kill_hmn.sh", "hostmasternoded")
                                                 try {
                                                     var startdeamon = await start_deamon("start_deamon.sh", "hostmasternoded")
                                                 } catch (error) { console.log(error) } */
                                                var serverrestarted2 = await restart_server('restart_server.sh', 'hostmasternode-cli', 'hostmasternoded')
                                                console.log("serverrestarted2 ",serverrestarted2)

                                                try {
                                                    var mnalias = "masternode" + freeOutputs.indexInMongodb
                                                    var startmasternode = await masternode_start('masternode_start.sh', 'hostmasternode-cli', mnalias)
                                                    console.log("startmasternode ",startmasternode)
                                                    try {
                                                        var transactionInfo = await getTransactionInfo('gettransactioninfo.sh', 'hostmasternode-cli', freeOutputs.txid)
                                                        console.log("transactionInfo ",transactionInfo)
                                                        var transactionInfojson = JSON.parse(transactionInfo)

                                                        if (transactionInfojson.details[0]) {
                                                            return {
                                                                success: true,
                                                                masternode_name: mnalias,
                                                                masternode_address: transactionInfojson.details[0].address
                                                            }
                                                        } else {
                                                            return { success: false, msg: "error when retrieving txInfo" }
                                                        }


                                                    } catch (error) {
                                                        return { success: false, msg: error }
                                                    }
                                                } catch (error) {
                                                    return { success: false, msg: error }

                                                }
                                                console.log(serverrestarted2)
                                            } catch (error) {
                                                return { success: false, msg: error }
                                            }

                                        } catch (error) {
                                            return { success: false, msg: error }
                                        }
                                    } else {
                                        console.log("there are no free outputs")
                                    }
                                } catch (error) {
                                    return { success: false, msg: error }
                                }


                            } catch (error) {
                                return { success: false, msg: error }
                            }

    /*                     }).catch(error => {
                            if (error.response) {
                                if (error.response.data == "Invalid address: Checksum mismatch. Code:1") {
                                    return { success: false, msg: error.response.data }

                                } else {
                                    return { success: false, msg: error }

                                }
                            } else {
                                return { success: false, msg: error }

                            }
                        }); */




                } catch (error) {
                    return { success: false, msg: error }
                }
            } catch (error) {
                return { success: false, msg: error }

            }
        } catch (error) {
            return { success: false, msg: error }


        }
    } catch (error) {
        return { success: false, msg: error }
    }

}


