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

db2.Users.createIndex({
    "email": 1
}, {
    unique: true
});

db2.Users.insert({
    email: 'test@test.com',
    // Default password is "changeme" and you should head it's advice...
    password: '$2b$10$NLNWO5ueXJ3XMMn/EQ8riOsb7nmIDoi1gRLn.QMipbm1GONHqOnCO'
});