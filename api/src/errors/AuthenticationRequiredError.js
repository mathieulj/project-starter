const AbstractError = require('./AbstractError');

/**
 * Not authenticated error for when authentication is expected but not yet done.
 */
class AuthenticationRequiredError extends AbstractError {
    /**
     * @inheritDoc
     * @param {String} message Error message to be logged.
     * @param {Object} [options]
     * @param {Number} [options.status=401] HTTP error code to respond with.
     */
    constructor(message, {status = 401} = {}) {
        super(message, {status});
    }
}

module.exports = AuthenticationRequiredError;
