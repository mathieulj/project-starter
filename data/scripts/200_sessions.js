db = new Mongo().getDB('admin');

db.auth('auth-user', 'auth-pass');

db2 = db.getSiblingDB('web-app');

db2.createCollection('Sessions');

db2.Sessions.createIndex({
    'key': 1
}, {
    unique: true
});

db2.Sessions.createIndex({
    'expiresAt': 1
}, {
    expireAfterSeconds: 0
});