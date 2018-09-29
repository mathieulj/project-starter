const logger = require('log4js').getLogger('sessionStore');
logger.warn('Reminder; This naive ram storage should never be used in production!');

/**
 * Simple hash map ram storage for sessions. Super simple but should be replaced with something more robust
 * for any substantial application.
 *
 * There are a few drawbacks to this naive approach that make it unsuitable for production.
 * - There is no garbage collection of old sessions
 * - There is no DOS protection
 * - These cant be shared across multiple instances (clustering)
 *
 * @type {Object<String, Object<*>>}
 */
const ramStore = {};

module.exports.get = async (key, maxAge, {rolling}) => { // eslint-disable-line no-unused-vars
    return ramStore[key] || {};
};

module.exports.set = async (key, session, maxAge, {rolling, changed}) => { // eslint-disable-line no-unused-vars
    ramStore[key] = session;
};

module.exports.destroy = async (key) => {
    delete ramStore[key];
};