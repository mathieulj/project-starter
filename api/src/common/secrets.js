const logger = require('log4js').getLogger('secrets');
const _SecretsFile = '../../config/secrets.json';

try {
    module.exports = require(_SecretsFile);
} catch (err) {
    const fs = require('fs');
    const path = require('path');
    const uuid = require('uuid/v4');

    const secretsPath = path.join(__dirname, _SecretsFile);
    const sessionSecrets = [(uuid() + uuid()).split('-').join('')];

    fs.writeFile(secretsPath, JSON.stringify({sessionSecrets}, null, 4), {mode: 0o660}, (err) => {
        if (err) {
            logger.error(err);
            throw err;
        }
    });

    module.exports = {sessionSecrets};
}
