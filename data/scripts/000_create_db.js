db = new Mongo().getDB('admin');

db.auth('auth-user', 'auth-pass');

db2 = db.getSiblingDB('web-app');

db2.createUser({
    user: 'application',
    pwd: 'application',
    roles: [{
        role: 'readWrite',
        db: 'web-app'
    }, {
        role: 'readWrite',
        db: 'web-app'
    }]
});

db2.createCollection('Users');