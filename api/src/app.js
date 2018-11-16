const bodyParser = require('koa-bodyparser');
const Koa = require('koa');
const log4js = require('log4js');
const Router = require('koa-router');
const session = require('koa-session');

log4js.configure(require('../config/logging.json'));
const logger = log4js.getLogger('app');

const csrfMiddleware = require('./csrfMiddleware');
const DB = require('./common/DB');
const errorMiddleware = require('./errors/errorMiddleware');
const permissionsMiddleware = require('./users/permissionsMiddleware');
const sessionStore = require('./users/sessionStore');
const {sessionSecrets} = require('./common/secrets');
const settings = require('./common/settings');

const app = new Koa();
app.proxy = true;
app.keys = sessionSecrets;

// Track user sessions
app.use(session({
    maxAge: settings.MAX_SESSION_AGE_MS,
    rolling: true,
    signed: true,
    store: sessionStore
}, app));

// Parse json bodies
app.use(bodyParser({
    enableTypes: ['json']
}));

// Ensure our errors are properly returned to the user
app.use(errorMiddleware);

// Ensure that mutating requests are protected from CSRF
app.use(csrfMiddleware);

// Ensure that authentication is required to access API
app.use(permissionsMiddleware);

const rootRouter = new Router({prefix: settings.APP_PREFIX});

rootRouter
    .use('/users', require('./users/router').routes());

app.use(rootRouter.routes());

// Wait until DB connection is live before binding to the host port
DB.then(() => {
    app.listen(3000);
    logger.info('Application is live, bound to port 3000');
}).catch((err) => {
    logger.error('Error starting database connection.', err);
    process.exit(-1);
});