const bcrypt = require('bcrypt');
const DB = require('../common/DB');
const NotFoundError = require('../errors/NotFoundError');
const ObjectID = require('mongodb').ObjectID;
const ValidationError = require('../errors/ValidationError');

const _SaltRounds = 10;

/**
 * User representation
 * @typedef {Object} User
 * @property {ObjectID} _id
 * @property {String} email
 */


/**
 * Assert that the given user email and passwords are a valid match.
 * @param {String} email
 * @param {String} password
 * @returns {Promise<{authenticated: boolean, userID: String}>}
 */
module.exports.assertAuth = async ({email, password}) => {
    const db = await DB;

    const user = await db.collection('Users').findOne({
        email
    });

    if (user) {
        if (await bcrypt.compare(password, user.password)) {
            return {
                authenticated: true,
                userID: user._id
            };
        }
    }

    throw new ValidationError('User password mismatch', {
        validationErrors: {
            email: 'values_do_not_match',
            password: 'values_do_not_match'
        }
    });
};

/**
 * Fetch a list of all users
 * @returns {Promise<Array<User>>}
 */
module.exports.getAll = async () => {
    const db = await DB;

    return db.collection('Users')
        .find({}, {
            projection: {
                password: 0
            }
        })
        .toArray();
};

/**
 * Create a new user
 * @param {String} email
 * @param {String} password
 * @returns {Promise<User>}
 */
module.exports.create = async ({email, password}) => {
    // FIXME: Implement user permissions logic, not just any user can create another user
    // FIXME: This should guard against a duplicate Email...
    const hash = await bcrypt.hash(password, _SaltRounds);

    const db = await DB;
    const {insertedId} = await db.collection('Users')
        .insertOne({
            email,
            password: hash
        });

    return await db.collection('Users')
        .findOne({
            _id: new ObjectID(insertedId)
        }, {
            projection: {
                password: 0
            }
        });
};

/**
 * Fetch an existing user by ID
 * @param {ObjectID} id
 * @returns {Promise<User>}
 */
module.exports.get = async (id) => {
    const db = await DB;

    const user = await db.collection('Users')
        .findOne({
            _id: new ObjectID(id)
        }, {
            projection: {
                password: 0
            }
        });

    if (!user) {
        throw new NotFoundError(`User id '${id}' not found.`, {
            type: 'User',
            id
        });
    }

    return user;
};

/**
 * Update an existing user by ID
 * @param {ObjectID} id
 * @param {Object} attributes
 * @param {String} attributes.email
 * @param {String} attributes.password
 * @returns {Promise<User>}
 */
module.exports.update = async (id, {email, password}) => {
    // FIXME: Implement user permissions logic, not just any user can modify any other user
    // FIXME: This should guard against a duplicate Email...
    const patch = {
        email
    };

    if (password) {
        patch.password = await bcrypt.hash(password, _SaltRounds);
    }

    const db = await DB;

    await db.collection('Users')
        .updateOne({
            _id: new ObjectID(id)
        }, {
            $set: patch
        });

    const user = await db.collection('Users')
        .findOne({
            _id: new ObjectID(id)
        }, {
            projection: {
                password: 0
            }
        });

    if (!user) {
        throw new NotFoundError(`User id '${id}' not found.`, {
            type: 'User',
            id
        });
    }

    return user;
};

/**
 * Delete a single user by ID
 * @param {ObjectID} id
 * @returns {Promise<>}
 */
module.exports.delete = async (id) => {
    // FIXME: Implement user permissions logic, not just any user can delete any other user
    const db = await DB;
    const {deletedCount} = await db.collection('Users')
        .deleteOne({
            _id: new ObjectID(id)
        });

    if (!deletedCount) {
        throw new NotFoundError(`User id '${id}' not found.`, {
            type: 'User',
            id
        });
    }
};
