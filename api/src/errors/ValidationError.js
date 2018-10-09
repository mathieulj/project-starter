const AbstractError = require('./AbstractError');

/**
 * Validation error class representing a field(s) that contain invalid data (ex empty string, duplicate, ...).
 */
class ValidationError extends AbstractError {
    /**
     * @inheritDoc
     * @param {String} message Error message to be logged.
     * @param {Object} options
     * @param {Number} [options.status=422] HTTP error code to respond with.
     * @param {Object<String, String>} options.validationErrors Hash map of field and i18n key of the validation error message.
     */
    constructor(message, {status = 422, validationErrors}) {
        super(message, {status});
        this.validationErrors = validationErrors;
    }

    /**
     * @inheritDoc
     * @returns {{status: Number, message: String, validationErrors: Object<String, String>}}
     */
    serialise() {
        return {
            ...super.serialise(),
            validationErrors: this.validationErrors
        };
    }
}

module.exports = ValidationError;
