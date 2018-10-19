const Ajv = require('ajv');
const InvalidRequestError = require('../errors/InvalidRequestError');

const ajv = new Ajv();

/**
 * Simple validation helper to check that the given request corresponds to the given schema.
 * @param request
 * @param schema
 * @returns {*}
 */
module.exports.getAPI = function (request, schema) {
    const validator = ajv.compile(schema);

    if (!validator(request)) {
        throw new InvalidRequestError(null, {validator});
    }

    return request;
};

/**
 * @typedef {String} ObjectID MongoDB object ID respecting the pattern /^[a-f0-9]{24}$/
 */

/**
 * Validation pattern for MongoDB Object IDs
 * @type {String}
 */
module.exports.idPattern = '^[a-f0-9]{24}$';