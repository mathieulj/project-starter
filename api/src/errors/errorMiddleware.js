const AbstractError = require('./AbstractError');
const log4js = require('log4js');
const logger = log4js.getLogger('app');

module.exports = async (ctx, next) => {
    try {
        await next();
    } catch (error) {
        if (error instanceof AbstractError) {
            const response = error.serialise();

            ctx.status = response.status;
            ctx.body = JSON.stringify(response);

            if (ctx.status >= 500) {
                // Only critically log server side errors in the error log.
                logger.error(error);
            } else {
                logger.info(error);
            }
            return;
        }

        // If the error wasn't one of our own, let the default machinery deal with it.
        throw error;
    }
};
