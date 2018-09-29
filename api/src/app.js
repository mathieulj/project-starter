const bodyParser = require('koa-bodyparser');
const Koa = require('koa');
const log4js = require('log4js');
const Router = require('koa-router');
const session = require('koa-session');

log4js.configure(require('../config/logging.json'));
const logger = log4js.getLogger('app');

const sessionStore = require('./sessionStore');
const {sessionSecrets} = require('./secrets');

const app = new Koa();
app.proxy = true;
app.keys = sessionSecrets;

// Track user sessions
app.use(session({
    maxAge: 5 * 60 * 1000,
    rolling: true,
    signed: true,
    store: sessionStore
}, app));

// Parse json bodies
app.use(bodyParser({
    enableTypes: ['json']
}));

const rootRouter = new Router({prefix: '/api'});

rootRouter
    .use('/users', require('./users/router').routes())
    .get('/', async (ctx, next) => {
        let n = ctx.session.views || 0;
        ctx.session.views = ++n;
        ctx.body = n + ' views.';
    });

app.use(rootRouter.routes());
app.listen(3000);