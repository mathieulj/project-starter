const AbstractError = require('./AbstractError');

/**
 * Access denied for when a user is not allowed to access the requested path/url.
 */
class AccessDeniedError extends AbstractError {
    /**
     * @inheritDoc
     * @param {String} message Error message to be logged.
     * @param {Object} [options]
     * @param {Number} [options.status=403] HTTP error code to respond with.
     */
    constructor(message, {status = 403} = {}) {
        super(message, {status});
    }
}

module.exports = AccessDeniedError;
