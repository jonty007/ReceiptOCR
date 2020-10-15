import i18n from 'i18n';

i18n.configure({
    locales: ['en', 'ru', 'fr', 'nl'],
    defaultLocale: 'en',
    queryParameter: 'lang',
    autoReload: true,
    updateFiles: false,
    directory: __dirname + '/locales',
    api: {
        '__': 'translate',
        '__n': 'translateN'
    }
});

export default i18n;
