#!/bin/bash
set -euo pipefail

function waitForMongo {
    port=$1
    n=0
    until [ $n -ge 20 ]
    do
        mongo admin --quiet --port $port --eval "db" && break
        n=$[$n+1]
        sleep 2
    done
}

if ! [[ -a /data/db/mydb-initialized ]]; then
    mongod & MONGO_PID=$!
    waitForMongo 27017
    mongo admin --port 27017 --eval "db.system.version.insert({ '_id' : 'authSchema', 'currentVersion' : 3 })"
    mongod --shutdown

    mongod & MONGO_PID=$!
    waitForMongo 27017
    mongo admin --port 27017 --eval "db.createUser({ user: '${MONGO_INITDB_ROOT_USERNAME}', pwd: '${MONGO_INITDB_ROOT_PASSWORD}', roles: [ 'root' ]})"
    mongo admin -u ${MONGO_INITDB_ROOT_USERNAME} -p ${MONGO_INITDB_ROOT_PASSWORD} --port 27017 --eval "db.createUser({ user: '${MONGO_RW_USERNAME}', pwd: '${MONGO_RW_PASSWORD}', roles: [ {role: 'readWrite', db: 'isf-website'}, {role: 'readWrite', db: 'sessions'} ]})"
    mongod --shutdown

    mongod -f /env/mongod.conf --auth & MONGO_PID=$!
    waitForMongo 27017
    mongo admin -u ${MONGO_INITDB_ROOT_USERNAME} -p ${MONGO_INITDB_ROOT_PASSWORD} --port 27017 --eval "db.runCommand({ replSetInitiate: '{}' })"
    mongo admin -u ${MONGO_INITDB_ROOT_USERNAME} -p ${MONGO_INITDB_ROOT_PASSWORD} --port 27017 --eval "db.setSlaveOk()"
    mongod --shutdown

    touch /data/db/mydb-initialized
fi

mongod -f /env/mongod.conf --auth & MONGO_PID=$!

waitForMongo 27017

trap 'echo "KILLING"; kill $MONGO_PID; wait $MONGO_PID' SIGINT SIGTERM EXIT

wait $MONGO_PID