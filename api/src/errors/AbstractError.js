/**
 * Base error class for all user facing errors.
 */
class AbstractError extends Error {
    /**
     * Base constructor.
     * @param {String} message Error message to be logged.
     * @param {Object} [options]
     * @param {Number} [options.status=500] HTTP error code to respond with.
     */
    constructor(message, {status = 500} = {}) {
        super(message);
        this.status = status;
    }

    /**
     * Return a serialised representation of the error for the HTTP response. Can be overridden by the
     * child implementation.
     * @returns {{status: Number, message: String}}
     */
    serialise() {
        return {
            message: this.message,
            status: this.status
        };
    }
}

module.exports = AbstractError;
