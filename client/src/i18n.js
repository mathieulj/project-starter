/**
 * Simple internationalisation management utility that utilises a template literal function localise strings.
 *
 * Best used with template literals
 * @example
 * const I18n = require('I18n');
 * const i18n = new I18n();
 * I18n.updateLocale('en', {User:'User','not':'not', found: 'found'});
 * I18n.updateLocale('fr', {User:'Utilisateur','not':'pas', found: 'trouvé'});
 *
 * let username = 'alien';
 *
 * console.log(i18n.translate`User ${username} not found`);
 * // => User alien not found
 *
 * i18n.locale = 'fr'
 * console.log(i18n.translate`User ${username} not found`);
 * // => Utilisateur alien pas trouvé
 *
 * @type {I18n}
 */
module.exports = class I18n {
    /**
     * Construct an internationalisation instance.
     * @param {String} [locale='en']
     */
    constructor(locale = 'en') {
        /**
         * Current locale.
         * @type {String}
         */
        this.locale = locale;
    }

    /**
     * Translates a single string
     * @param {String} string
     * @returns {String}
     */
    translateString(string) {
        const dictionary = dictionaries[this.locale] || {};

        return string
            .split(' ')
            .map(
                (word) =>
                    word &&
                    (word in dictionary
                        ? dictionary[word]
                        : `??${this.locale}:${word}??`)
            )
            .join(' ');
    }

    /**
     * Translates a string template with the given literals.
     * @param {Array<String>} template
     * @param {Array<String>} literals
     * @returns {String}
     */
    translate(template, ...literals) {
        return template
            .slice(1)
            .reduce(
                (string, segment, index) =>
                    string + literals[index] + this.translateString(segment),
                this.translateString(template[0])
            );
    }

    /**
     * (Re)Load a i18n locale
     * @param {String} newLocale
     * @param {I18nLocaleDictionary} dictionary
     */
    static updateLocale(newLocale, dictionary) {
        dictionaries[newLocale] = dictionary;
    }
};

/**
 * @typedef {Object<String, String>} I18nLocaleDictionary
 */

/**
 * Hash map of loaded locale dictionaries
 * @type {Object<String, I18nLocaleDictionary>}
 */
const dictionaries = {};
