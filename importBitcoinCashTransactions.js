var pgp = require('pg-promise')(/*options*/)
var async = require('async')
var fs = require('fs')
var config = require('./config')

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

console.log('Starting Bitcoin Cash')

console.log('Reading files')
fs.readdir(config.bitcoinABCDump+'*.out', (err, files) => {
  if(err){
    console.log(err)
    process.exit(2)
  }

  if(files.length > 0) {

    console.log('Connecting to DB')
    var db = connectDB()
    importFiles(files, db)

  } else {
    process.exit(1)
  }
})

function importFiles(files, db) {
  async.mapLimit(files, 10, (filename, callback) => {

    let fileSplit = filename.splt('-')
    if(fileSplit.length <= 1) {
      return callback()
    }

    if(fileSplit[1] == 'bitcoinABC') {
      switch (fileSplit[0]) {
        case 'cs':
          copyUTXOs(db, filename, callback)
          break;
        case 'balances':
          copyAccounts(db, filename, callback)
          break;
        default:
          callback()
      }
    } else {
      callback()
    }
  },
  handleDone)
}


function copyUTXOs(db, filename, callback) {
  db.none("COPY bitcoinABC_utxo FROM $1 delimiter ';';",
  [config.bitcoinABCDump+filename])
  .then(() => {
    fs.renameSync(congig.bitcoinABCDump+filename, congig.bitcoinABCArchive+filename)
    callback()
  })
  .catch(callback)
}

function copyAccounts(db, filename, callback) {
  db.none("COPY bitcoinABC_accounts FROM $1 delimiter ';';",
  [config.bitcoinABCDump+filename])
  .then(() => {
    fs.renameSync(congig.bitcoinABCDump+filename, congig.bitcoinABCArchive+filename)
    callback()
  })
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
