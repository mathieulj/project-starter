const DB = require('../common/DB');
const ObjectID = require('mongodb').ObjectID;

/**
 * Retrieve a given session
 * @param {String} key
 * @returns {Promise<Object>}
 */
module.exports.get = async (key) => {
    const db = await DB;
    const {session} = await db.collection('Sessions').findOne({
        key
    });

    if (!session) {
        return {};
    }

    return session;
};

/**
 * Update a given session
 * @param {String} key
 * @param {Object} session
 * @param {Number} maxAge
 * @param {Object} options
 * @param {Boolean} options.changed If the session has changed since it was fetched
 * @returns {Promise<>}
 */
module.exports.set = async (key, session, maxAge, {changed}) => {
    const db = await DB;
    const {_expire, _maxAge} = session;
    const expiresAt = new Date(_expire);

    let $set = {};
    if (changed) {
        // Overwrite the session since it was changed
        $set = {
            expiresAt,
            session
        };
    } else {
        // Update the timeouts only to lessen the race with other requests
        $set = {
            expiresAt,
            'session._expire': _expire,
            'session._maxAge': _maxAge
        };
    }

    await db.collection('Sessions')
        .updateOne({
            key,
        }, {
            $setOnInsert: {key},
            $set
        }, {
            upsert: true
        });
};

/**
 * Destroy a given session
 * @param {String} key
 * @returns {Promise<>}
 */
module.exports.destroy = async (key) => {
    const db = await DB;
    await db.collection('Sessions')
        .deleteOne({
            key
        });
};

/**
 * Clears all session's userIDs that match the given user ID
 * @param {ObjectID} userID
 * @returns {Promise<>}
 */
module.exports.clearAny = async (userID) => {
    const db = await DB;
    await db.collection('Sessions')
        .updateMany({
            'session.userID': new ObjectID(userID)
        }, {
            $set: {
                'session.userID': null
            }
        });
};