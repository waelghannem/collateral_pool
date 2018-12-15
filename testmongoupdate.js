const Output = require('./models/output')


function add_output(newoutput){
    return new Promise(function (resolve, reject) {
        newoutput.save((err, output) => {
            if (err) {
                console.log('failed to add output ', err)
                reject({ success: false, msg: 'failed to add output ', err })
            } else {
                console.log('output added')
                resolve({ success: true, msg: 'output added' })
            }
        })
    })
}

(async function(){
    var newoutput = new Output({
        txid : "test",
        index : "test"
    })
    try {
        var insert = await add_output(newoutput)
        console.log(insert)
    } catch (error) {
        console.log(error)
    }
})()
