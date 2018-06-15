var pgp = require('pg-promise')(/*options*/)
var config = require('config')

function connectDB(){
  var cn = {
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password
  }
  return pgp(cn)
}

console.log('Starting Litecoin')

console.log('Connecting to DB')
var db = connectDB()
console.log('Importing File')
copyCSV(db, handleDone)

function copyCSV(db, callback) {
  db.none("COPY litecoin_utxo FROM $1 delimiter ';';",
  [config.litecoinDump])
  .then(callback)
  .catch(callback)
}

function handleDone(err){
  if (err) {
    console.log(err)
    process.exit(2)
  }

  console.log('Done')
  process.exit(1)
}
