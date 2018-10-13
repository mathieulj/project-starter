const {MongoClient} = require('mongodb');

const log4js = require('log4js');
const logger = log4js.getLogger('common.DB');

const mongoUser = 'application';
const mongoPass = 'application';
const mongodHost = 'mongod';
const mongodPort = 27017;
const dbName = 'web-app';

const mongodUrl = `mongodb://${mongoUser}:${mongoPass}@${mongodHost}:${mongodPort}/${dbName}`;

/**
 * Crude initial holdoff to ensure Docker startup sequence doesnt fail our startup if the DB is slow to come up.
 * @param {number} retries
 * @returns {Promise<mongodb.MongoClient>}
 */
const attemptConnection = async (retries) => {
    try {
        const client = await MongoClient.connect(mongodUrl, {
            useNewUrlParser: true
        });

        return client.db(dbName);
    } catch (err) {
        if (retries > 0) {
            logger.info('Database error during initialisation, will retry');
            await new Promise((r) => setTimeout(r, 1000));
            return attemptConnection(retries - 1);
        }
        throw err;
    }
};
/**
 * Module resolves to a connected MongoDB client instance
 * @type {Promise<mongodb.MongoClient>}
 */
module.exports = attemptConnection(5);