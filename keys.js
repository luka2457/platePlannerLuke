require('dotenv').config({ path: 'process.env' });

//var key =  process.env.KEY;
var key = [process.env.KEY, process.env.KEY1, process.env.KEY2, process.env.KEY3]

module.exports = key;