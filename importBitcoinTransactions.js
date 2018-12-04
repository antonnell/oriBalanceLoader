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

console.log('Starting Bitcoin')

console.log('Reading files')
fs.readdir(config.bitcoinDump, (err, files) => {
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

    console.log(filename)
    let fileSplit = filename.split('-')
    if(fileSplit.length <= 1) {
      return callback()
    }

    if(fileSplit[1] == 'bitcoin') {
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
  db.none("COPY bitcoin_utxo FROM $1 delimiter ';';",
  [config.bitcoinDump+filename])
  .then(() => {
    fs.renameSync(congig.bitcoinDump+filename, congig.bitcoinArchive+filename)
    callback()
  })
  .catch(callback)
}

function copyAccounts(db, filename, callback) {
  db.none("COPY bitcoin_accounts FROM $1 delimiter ';';",
  [config.bitcoinDump+filename])
  .then(() => {
    fs.renameSync(congig.bitcoinDump+filename, congig.bitcoinArchive+filename)
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
