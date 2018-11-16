const AbstractError = require('./AbstractError');

/**
 * Not acceptable error for when an request is made with invalid headers or type.
 */
class NotFoundError extends AbstractError {
    /**
     * @inheritDoc
     * @param {String} message Error message to be logged.
     * @param {Object} [options]
     * @param {Number} [options.status=406] HTTP error code to respond with.
     */
    constructor(message, {status = 406} = {}) {
        super(message, {status});
    }
}

module.exports = NotFoundError;
