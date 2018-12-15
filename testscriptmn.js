const pool_params = require('./config/pool_params')
const exec = require('child_process').exec;
const bitcoin_rpc = require('node-bitcoin-rpc')
const fs = require('fs')
const credentials = {
    rpcuser : "wael",
    rpcpassword : "wael",
    CREATE_MASTERNODE_FILE : "test.sh"
}
function create_masternode_Promise(credentials){
    return new Promise(function(resolve,reject) {
        exec(sh ${credentials.CREATE_MASTERNODE_FILE} ${credentials.rpcuser} ${credentials.rpcpassword} ${credentials.rpcport}, (err, stdout, stderr) => {
            if (!err) {
                resolve(stdout)

            } else {
                reject(err)
            }
        });
    })
}

function readMnFromFile(){
    return new Promise(function(resolve,reject) {
    fs.readFile('newmn.txt', (err, data) => {
    if (err) reject(err);
    resolve(data);
  });
    })
}

(async function run(){
    try {
        var result = await create_masternode_Promise(credentials)
        console.log("after exec create masternode ",result)
        try {
            var newmn = await readMnFromFile()
        } catch (error) {
            console.log(error)
        }
    } catch (error) {
        console.log("error : ",error)
        
    }
}
)()
