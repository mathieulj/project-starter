const bcrypt = require('bcrypt');
const DB = require('../common/DB');
const {MongoError} = require('mongodb');
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
    const hash = await bcrypt.hash(password, _SaltRounds);

    try {
        const db = await DB;
        const {ops} = await db.collection('Users')
            .insertOne({
                email,
                password: hash
            });

        const [user] = ops;
        delete user.password;
        return user;
    } catch (err) {
        if (err instanceof MongoError) {
            // MongoDB error 11000 is a duplicate key error
            if (/E11000/.test(err.message)) {
                throw new ValidationError(`Duplicate email "${email}"`, {
                    validationErrors: {
                        email: 'duplicate'
                    }
                });
            }
        }
        throw err;
    }
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
 * @param {String} [attributes.email]
 * @param {String} [attributes.password]
 * @returns {Promise<User>}
 */
module.exports.update = async (id, {email, password}) => {
    // FIXME: Implement user permissions logic, not just any user can modify any other user
    const patch = {};

    if (email) {
        patch.email = email;
    }

    if (password) {
        patch.password = await bcrypt.hash(password, _SaltRounds);
    }

    const db = await DB;

    try {
        const {value} = await db.collection('Users')
            .findOneAndUpdate({
                _id: new ObjectID(id)
            }, {
                $set: patch
            }, {
                projection: {
                    password: 0
                },
                returnOriginal: false
            });

        if (!value) {
            throw new NotFoundError(`User id '${id}' not found.`, {
                type: 'User',
                id
            });
        }

        return value;
    } catch (err) {
        if (err instanceof MongoError) {
            // MongoDB error 11000 is a duplicate key error
            if (/E11000/.test(err.message)) {
                throw new ValidationError(`Duplicate email "${email}"`, {
                    validationErrors: {
                        email: 'duplicate'
                    }
                });
            }
        }
        throw err;
    }
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
