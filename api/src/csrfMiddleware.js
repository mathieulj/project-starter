const NotAcceptableError = require('./errors/NotAcceptableError');

module.exports = async (ctx, next) => {
    if (['OPTIONS', 'HEAD', 'GET'].includes(ctx.method)) {
        // These methods are mutation free and thus CSRF safe
        await next();
    } else if ('application/json' === ctx.request.type) {
        // Dont allow any mime type other than JSON (prevent form based CSRF)
        await next();
    } else {
        throw new NotAcceptableError('Request mime type is not acceptable, expecting \'application/json\'');
    }
};