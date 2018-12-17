const express = require('express')
const bodyParser = require('body-parser')

    
const passport = require('passport')
const mongoose = require('mongoose')
const path = require('path');
const exec = require('child_process').exec;
const cors = require('cors');
const app = require('express')();
const users = require('./routes/users')
const addresses = require('./routes/addresses')
const coins = require('./routes/coins')
const depositRequests = require('./routes/deposit_requests')
const depositsStatus = require('./routes/deposits_status')
const check_deposit = require('./check_deposit')
const create_masternodes = require('./create_masternodes')
const reward_distribution = require('./reward_distribution')
const cookieParser = require('cookie-parser');

//const config = require('./config/database')
const config = require('./config/config').get(process.env.NODE_ENV);

//const send_collateral = require('./send_collateral'


//send_collateral.start()


//setTimeout(() => {send_collateral.stop()},130000)

//console.log(check_deposit);
//check_deposit()
//create_masternodes()
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
var publicDir = require('path').join(__dirname,'/public');
app.use('/static', express.static('public'));
app.use(passport.initialize())
app.use(passport.session())
//require('./config/passport')(passport)

app.use('/users',users.router)
app.use('/addresses',addresses.router)
app.use('/coins',coins.router)
app.use('/depositRequests',depositRequests.router)
//app.use('/depositsStatus',depositsStatus.router)


mongoose.Promise = global.Promise;

mongoose.connect(config.DATABASE, { useNewUrlParser: true }, (err) => {
    if (err) {
        console.log('could not connect to database' + err);
    } else {
        console.log('connected to db :' + config.DATABASE);
    }
});

app.get('/',function(req,res){
    res.send("hello world")
})

const port = process.env.PORT || 3014


app.listen(port, () => {
    console.log("server started listening on port ",port) 
 })
