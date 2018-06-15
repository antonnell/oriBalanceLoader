# Origin Chainstate Balance Loader

Loads the UTXOs that were dumped by the [Chainparser](https://github.com/antonnell/oriChainstate) into a PostgreSQL db.

## Installing the packages

```
npm install
```

If it doesn't build, you may have additional dependencies. You will want to add those dependencies into the package.json and then run:
```
npm install
```
or
```
"npm install {dep} --save" as well.
```

## Prerequisite


### PostgreSQL DB setup

Create the postgreSQL DB:

```
./postgres/createDB.sql
```


### Config setup

Copy config/example.config.js and save it as {env}.config.js

```
{env} =
development
production
```

Update the {env}.config.js file with the PostgreSQL connection details and Chainstate dump files.


### Chainparser Setup

Run the [Chainparser](https://github.com/antonnell/oriChainstate) to generate the raw files


## How to run


```
node import{Chain}Transactions.js

{chain} =
* bitcoin
* bitoin-abc
* dash
* litecoin
```
