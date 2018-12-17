const exec = require('child_process').exec;
function getNewAddress() {

    return new Promise(function (resolve, reject) {
        exec(`sh getnewaddress.sh`, (err, stdout, stderr) => {
            if (err) {
                reject(err)
            } else if (stderr) {
                reject(stderr)
            } else {
                if (stdout) {
                    resolve({stdout : stdout})
                } else {
                    reject("address generating error")
                }
            }
        });
    })
}



(async function(){
    try {
        var res = await getNewAddress()
        console.log("res is ",res)
    } catch (error) {
        console.log(error)
    }
})()
