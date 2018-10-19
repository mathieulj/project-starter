const AuthenticationRequiredError = require('../errors/AuthenticationRequiredError');
const AccessDeniedError = require('../errors/AccessDeniedError');
const NotFoundError = require('../errors/NotFoundError');
const settings = require('../common/settings');
const UsersController = require('./controller');

/**
 * Hash map of urls and their methods that are allowed without authentication
 * @type {Object<String, Array<String>>}
 * @private
 */
const _AllowedWithoutAuth = {
    '/users/auth': ['GET', 'PUT']
};

/**
 * Regular expression matching the root of the application prefix.
 * @type {RegExp}
 */
const pathRootRegExp = new RegExp('^' + settings.APP_PREFIX);

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

/**
 * Hash map of HTTP methods and their required permissions.
 * @type {Object<String, 'read' | 'update' | 'create' | 'delete'>}
 * @private
 */
const _methodPermissionMap = {
    options: 'read',
    head: 'read',
    get: 'read',
    patch: 'update',
    put: 'update',
    post: 'create',
    delete: 'delete'
};

module.exports = async (ctx, next) => {
    const {method, path, request} = ctx;
    const relativePath = path.replace(pathRootRegExp, '');

    if (canAccessURLWithoutAuth(relativePath, method)) {
        await next();
        return;
    }

    if (!ctx.session.userID) {
        throw new AuthenticationRequiredError(`Authentication required for ${method} '${path}'`);
    }

    let user;
    try {
        user = await UsersController.get(ctx.session.userID);
    } catch (err) {
        // If the user no longer exists, update the session
        if (err instanceof NotFoundError) {
            ctx.session.userID = null;
            throw new AuthenticationRequiredError(`Authentication required for ${method} '${path}'`);
        }
        throw err;
    }

    // Save the user on the request state object.
    ctx.state.user = user;

    const action = _methodPermissionMap[method.toLowerCase()];
    if (!action || !UsersController.isPermitted(user, action, relativePath, request.body)) {
        throw new AccessDeniedError(`You do not have permission to ${method} '${path}' with the given payload.`);
    }

    await next();
};