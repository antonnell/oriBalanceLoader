

drop table if exists bitcoin_utxo;
create table bitcoin_utxo (
	txn_hash char(64),
	txn_no char(1),
	address char(34),
	amount bigint
);


drop table if exists bitcoin_accounts;
create table bitcoin_accounts (
 acc_hash char(64),
 balance bigint
);


drop table if exists bitcoin_cash_utxo;
create table bitcoin_cash_utxo (
	txn_hash char(64),
	txn_no char(1),
	address char(34),
	amount bigint
);


drop table if exists bitcoin_cash_accounts;
create table bitcoin_cash_accounts (
 acc_hash char(64),
 balance bigint
);


drop table if exists litecoin_utxo;
create table litecoin_utxo (
	txn_hash char(64),
	txn_no char(1),
	address char(34),
	amount bigint
);


drop table if exists litecoin_accounts;
create table litecoin_accounts (
 acc_hash char(64),
 balance bigint
);


drop table if exists dash_utxo;
create table dash_utxo (
	txn_hash char(64),
	txn_no char(1),
	address char(34),
	amount bigint
);


drop table if exists dash_accounts;
create table dash_accounts (
 acc_hash char(64),
 balance bigint
);
