const logger = require('log4js').getLogger('users.router');
const Router = require('koa-router');
const router = new Router();

router
    .get('/', async (ctx, next) => {
        ctx.body = [];
    })
    .get('/auth', async (ctx, next) => {
        ctx.body = {
            authenticated: false
        };
    })
    .put('/auth', async (ctx, next) => {
        ctx.body = {
            authenticated: true
        };
    })
    .get(':id', async (ctx, next) => {
        logger.info('Get ');
    })
    .put(':id', async (ctx, next) => {

    })
    .del(':id', async (ctx, next) => {

    })
    .post('/', async (ctx, next) => {

    });

module.exports = router;
