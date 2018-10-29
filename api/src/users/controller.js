const bcrypt = require('bcrypt');
const DB = require('../common/DB');
const {MongoError} = require('mongodb');
const NotFoundError = require('../errors/NotFoundError');
const ObjectID = require('mongodb').ObjectID;
const ValidationError = require('../errors/ValidationError');

const _SaltRounds = 10;

/**
 * User permissions url.
 *
 * Regex will be instantiated with the new RegExp(PermissionURL)
 * @typedef {String} PermissionURL Regex string of the permission URL
 */

/**
 * User permissions limit
 * @typedef {Array<String>} PermissionLimits Any attributes that must not be in the request body for the rule to match.
 */

/**
 * User permissions object.
 * @typedef {Object} UserPermissions
 * @property {Object<PermissionURL, PermissionLimits>} permissions.create
 * @property {Array<PermissionURL>} permissions.delete
 * @property {Array<PermissionURL>} permissions.read
 * @property {Object<PermissionURL, PermissionLimits>} permissions.update
 */
/**
 * User representation
 * @typedef {Object} User
 * @property {ObjectID} _id
 * @property {String} email
 * @property {UserPermissions} permissions
 */

/**
 * Default user permissions.
 * @type {UserPermissions}
 * @private
 */
const _DefaultUserPermissions = {
    create: {
        // Allow creation of users only with default permissions
        '^users$': ['permissions']
    },
    read: [
        // Allow reading any document
        '.*'
    ],
    update: {
        // Allow self update except email or permissions changes
        '^users/{{self}}$': ['email', 'permissions']
        // All other updates denied
    },
    delete: [
        // Allow self removal
        '^users/{{self}}$'
        // All other deletes denied
    ]
};

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
 * @param {Object} attributes
 * @param {String} attributes.email
 * @param {String} attributes.password
 * @param {UserPermissions} [attributes.permissions]
 * @returns {Promise<User>}
 */
module.exports.create = async ({email, password, permissions}) => {
    const hash = await bcrypt.hash(password, _SaltRounds);

    try {
        const db = await DB;
        const {ops} = await db.collection('Users')
            .insertOne({
                email,
                password: hash,
                permissions: permissions || _DefaultUserPermissions
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
 * @param {UserPermissions} [attributes.permissions]
 * @returns {Promise<User>}
 */
module.exports.update = async (id, attributes) => {
    if (attributes.password) {
        // FIXME Invalidate session when the password changes...
        attributes.password = await bcrypt.hash(attributes.password, _SaltRounds);
    }

    const db = await DB;

    try {
        const {value} = await db.collection('Users')
            .findOneAndUpdate({
                _id: new ObjectID(id)
            }, {
                $set: attributes
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
                throw new ValidationError(`Duplicate email "${attributes.email}"`, {
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

/**
 * Simple cache of compiled regular expressions.
 * @type {Object<String, RegExp>}
 * @private
 */
const _RegExpCache = {};

/**
 * Get a cached RegExp object for the given string.
 * @param {String} regexp
 * @returns {RegExp}
 */
const getRegExp = function (regexp) {
    if (!(regexp in _RegExpCache)) {
        _RegExpCache[regexp] = new RegExp(regexp);
    }
    return _RegExpCache[regexp];

};

/**
 * Checks if the given user has permission to do the given action on the given url.
 * @param {User} user
 * @param {'create' | 'delete' | 'read' | 'update'} action
 * @param {String} url
 * @param {Object} body
 */
module.exports.isPermitted = function (user, action, url, body) {
    const permissions = user.permissions[action];
    const userID = user._id;

    // Quick and dirty homogenisation to only have one code path through iteration. Could likely be optimised for
    // better performance.
    const iterate = Array.isArray(permissions) ? permissions.map((p) => [p]) : Object.entries(permissions);

    for (const [permittedUrl, limits] of iterate) {
        const regexp = permittedUrl.replace('{{self}}', userID);
        if (getRegExp(regexp).test(url)) {
            if (!limits || !limits.some((limit) => limit in body)) {
                return true;
            }
        }
    }

    return false;
};
