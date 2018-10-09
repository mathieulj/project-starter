const ApiHelper = require('../common/ApiHelper');
const Router = require('koa-router');
const userController = require('./controller');

const router = new Router();

router.get('/auth', async (ctx) => {
    ctx.body = {
        authenticated: !!ctx.session.userID,
        userID: ctx.session.userID
    };
});

router.put('/auth', async (ctx) => {
    const {email, password} = ApiHelper.getAPI(ctx.request.body, {
        title: 'User authentication request',
        type: 'object',
        properties: {
            email: {
                description: 'User E-mail address.',
                type: 'string'
            },
            password: {
                description: 'User password.',
                type: 'string'
            }
        }
    });

    if (!email) {
        ctx.session.userID = null;

        ctx.body = {
            authenticated: false,
            userID: null
        };
    } else {
        try {
            const auth = await userController.assertAuth({email, password});
            ctx.session.userID = auth.userID;
            ctx.body = auth;
        } catch (err) {
            // If the assertion failed, ensure to clear the dangling session's authorisation.
            ctx.session.userID = null;
            throw err;
        }
    }
});

router.get('/', async (ctx) => {
    ctx.body = await userController.getAll();
});

router.get('/:id', async (ctx) => {
    const {id} = ApiHelper.getAPI(ctx.params, {
        title: 'User fetch',
        type: 'object',
        properties: {
            id: {
                description: 'User ID.',
                pattern: ApiHelper.idPattern,
                type: 'string'
            }
        },
        required: ['id']
    });

    ctx.body = await userController.get(id);
});

router.put('/:id', async (ctx) => {
    const {id} = ApiHelper.getAPI(ctx.params, {
        title: 'User update',
        type: 'object',
        properties: {
            id: {
                description: 'User ID.',
                pattern: ApiHelper.idPattern,
                type: 'string'
            }
        },
        required: ['id']
    });

    const attributes = ApiHelper.getAPI(ctx.request.body, {
        title: 'User authentication request',
        type: 'object',
        properties: {
            email: {
                description: 'User E-mail address.',
                type: 'string'
            },
            password: {
                description: 'User password.',
                type: 'string'
            }
        },
        required: ['email']
    });

    ctx.body = await userController.update(id, attributes);
});

router.del('/:id', async (ctx) => {
    const {id} = ApiHelper.getAPI(ctx.params, {
        title: 'User delete',
        type: 'object',
        properties: {
            id: {
                description: 'User ID.',
                pattern: ApiHelper.idPattern,
                type: 'string'
            }
        },
        required: ['id']
    });

    await userController.delete(id);
    ctx.body = {};
});

router.post('/', async (ctx) => {
    const attributes = ApiHelper.getAPI(ctx.request.body, {
        title: 'User create',
        type: 'object',
        properties: {
            email: {
                description: 'User E-mail address.',
                type: 'string'
            },
            password: {
                description: 'User password.',
                type: 'string'
            }
        },
        required: ['email', 'password']
    });

    ctx.body = await userController.create(attributes);
});

module.exports = router;
