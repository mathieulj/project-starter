const DB = require('./common/DB');

module.exports.get = async (key, maxAge, {rolling}) => { // eslint-disable-line no-unused-vars
    const db = await DB;
    const {session} = await db.collection('Sessions').findOne({
        key
    });

    if(!session) {
        return {};
    }

    return session;
};

module.exports.set = async (key, session, maxAge, {rolling, changed}) => { // eslint-disable-line no-unused-vars
    const db = await DB;
    await db.collection('Sessions')
        .updateOne({
            key
        }, {
            $setOnInsert : {
                key
            },
            $set: {
                session,
                expiresAt : new Date(Date.now() + maxAge)
            }
        }, {
            upsert: true
        });
};

module.exports.destroy = async (key) => {
    const db = await DB;
    await db.collection('Sessions')
        .deleteOne({
            key
        });
};