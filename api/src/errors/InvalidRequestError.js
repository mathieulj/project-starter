const AbstractError = require('./AbstractError');

/**
 * Invalid request error representing a failure to respect the published API
 */
class InvalidRequestError extends AbstractError {
    /**
     * @inheritDoc
     * @param {String} message Error message to be logged.
     * @param {Object} options
     * @param {Number} [options.status=400] HTTP error code to respond with.
     * @param {Object} options.validator Ajv validator of the API that failed to be respected.
     */
    constructor(message, {status = 400, validator}) {
        const {schema, errors} = validator;
        super(message || `Invalid request for '${schema.title}'`, {status});

        this.validatorSchema = schema;
        // Clone the error object synchronously since the Ajv property is re-used by the next validation.
        this.validatorErrors = errors.slice();
    }

    /**
     * @inheritDoc
     * @returns {{status: Number, message: String, errors: Array<Object>, schema: Object}}
     */
    serialise() {
        return {
            ...super.serialise(),
            errors: this.validatorErrors,
            schema: this.validatorSchema,
        };
    }
}

module.exports = InvalidRequestError;
