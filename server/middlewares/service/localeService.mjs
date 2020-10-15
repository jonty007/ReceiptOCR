/**
 * LocaleService
 */
export class LocaleService {
    /**
     *
     * @param opts The i18n provider object opts
     */
    constructor(opts) {
        this.i18nProvider = opts.i18nProvider;
    }

    /**
     *
     * @returns {string} The current locale code
     */
    getCurrentLocale() {
        return this.i18nProvider.getLocale();
    }

    /**
     *
     * @returns string[] The list of available locale codes
     */
    getLocales() {
        return this.i18nProvider.getLocales();
    }

    /**
     *
     * @param locale The locale to set. Must be from the list of available locales.
     */
    setLocale(locale) {
        if (this.getLocales().indexOf(locale) !== -1) {
            this.i18nProvider.setLocale(locale)
        }
    }

    /**
     *
     * @param string String to translate
     * @param args Extra parameters
     * @returns {string} Translated string
     */
    translate(string, args = undefined) {
        return this.i18nProvider.__(string, args)
    }

    /**
     *
     * @param singular Object to translate
     * @param plural Object to translate
     * @param count The plural number
     * @returns {string} Translated string
     */
    translatePlurals(singular, plural, count) {
        return this.i18nProvider.__n(singular, plural, count)
    }
}