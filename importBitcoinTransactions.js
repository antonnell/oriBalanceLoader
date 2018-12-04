var pgp = require('pg-promise')(/*options*/)
var async = require('async')
var fs = require('fs')
var config = require('./config')
var parse = require('csv-parse')

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
  async.mapLimit(files, 1, (filename, callback) => {

    console.log(filename)
    if(filename.includes('.err')) {
      return callback()
    }
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
  fs.readFile(config.bitcoinDump+filename, (err, fileData) => {
    if(err) {
      return callback(err)
    }

    parse(fileData, {delimiter: ';'}, (err, data) => {

      //create temp table
      createTmpUTXO(db, (err) => {
        if(err) {
          return callback(err)
        }

        //dump into temp table
        async.mapLimit(data, 10, (rowData, callbackInner) => {
          insertUTXO(db, rowData, callbackInner)
        },
        (err) => {
          if(err) {
            return callback(err)
          }

          transferUTXOs(db, callback)
        })
      })
    })
  })
}

function createTmpUTXO(db, callback) {
  db.none('create table bitcoin_utxo_tmp (txn_hash char(64), txn_no char(1), address char(34), amount bigint);')
  .then(callback)
  .catch(callback)
}

function insertUTXO(db, row, callback) {
  db.none('insert into bitcoin_utxo_tmp (txn_hash, txn_no, address, amount) values ($1, $2, $3, $4);',
  [row[0], row[1], row[2], row[3]])
  .then(callback)
  .catch(callback)
}

function transferUTXOs(db, callback){
  db.none('truncate table bitcoin_utxo;')
  .then(() => {
    db.none('insert into bitcoin_utxo (txn_hash, txn_no, address, amount) select txn_hash, txn_no, address, amount from bitcoin_utxo_tmp;')
    .then(() => {
      db.none('drop table bitcoin_utxo_tmp;')
      .then(callback)
      .catch(callback)
    })
    .catch()
  })
  .catch(callback)
}

function copyAccounts(db, filename, callback) {
  fs.readFile(config.bitcoinDump+filename, (err, fileData) => {
    if(err) {
      return callback(err)
    }

    parse(fileData, {delimiter: ';'}, (err, data) => {

      //create temp table
      createTmpAccount(db, (err) => {
        if(err) {
          return callback(err)
        }

        //dump into temp table
        async.mapLimit(data, 10, (rowData, callbackInner) => {
          insertAccount(db, rowData, callbackInner)
        },
        (err) => {
          if(err) {
            return callback(err)
          }

          transferAccounts(db, callback)
        })
      })
    })
  })
}

function createTmpAccount(db, callback) {
  db.none('create table bitcoin_accounts_tmp (acc_hash char(64), balance bigint);')
  .then(callback)
  .catch(callback)
}

function insertAccount(db, row, callback) {
  db.none('insert into bitcoin_accounts_tmp (acc_hash, balance) values ($1, $2);',
  [row[0], row[1]])
  .then(callback)
  .catch(callback)
}

function transferAccounts(db, callback){
  db.none('truncate table bitcoin_accounts;')
  .then(() => {
    db.none('insert into bitcoin_accounts (acc_hash, balance) select acc_hash, balance from bitcoin_accounts_tmp;')
    .then(() => {
      db.none('drop table bitcoin_accounts_tmp;')
      .then(callback)
      .catch(callback)
    })
    .catch()
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
