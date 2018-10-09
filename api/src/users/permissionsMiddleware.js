const AuthenticationRequiredError = require('../errors/AuthenticationRequiredError');

/**
 * Hash map of urls and their methods that are allowed without authentication
 * @type {Object<String, Array<String>>}
 * @private
 */
const _AllowedWithoutAuth = {
    '/api/users/auth': ['GET', 'PUT']
};

/**
 * Perform the check to validate if a url & method is allowed without authentication.
 * @param {String} path The path being accessed
 * @param {String} method The HTTP method being used
 * @returns {boolean}
 */
const canAccessURLWithoutAuth = (path, method) => {
    for (const [allowedPath, allowedMethods] of Object.entries(_AllowedWithoutAuth)) {
        if (allowedPath === path) {
            return allowedMethods.includes(method);
        }
    }
    return false;
};


module.exports = async (ctx, next) => {
    if (canAccessURLWithoutAuth(ctx.path, ctx.method)) {
        await next();
        return;
    }

    if (!ctx.session.userID) {
        throw new AuthenticationRequiredError(`Authorisation required for ${ctx.method} '${ctx.path}'`);
    }

    // TODO Implement user permissions logic to limit accessible URLs.

    await next();
};