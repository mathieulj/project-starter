const AbstractError = require('./AbstractError');

/**
 * Not found error for when an expected record cannot be found.
 */
class NotFoundError extends AbstractError {
    /**
     * @inheritDoc
     * @param {String} message Error message to be logged.
     * @param {Object} options
     * @param {Number} [options.status=404] HTTP error code to respond with.
     * @param {String} options.type Type of the document that is missing
     * @param {String} options.id ID that was not found
     */
    constructor(message, {status = 404, type, id}) {
        super(message || `Could not find '${id}'(${type}).`, {status});

        this.type = type;
        this.id = id;
    }

    /**
     * @inheritDoc
     * @returns {{status: Number, message: String, id: String, type: String}}
     */
    serialise() {
        return {
            ...super.serialise(),
            id: this.id,
            type: this.type
        };
    }
}

module.exports = NotFoundError;
