// this is just a test file for command line
// test it via command: node --experimental-modules internationalization.mjs

import container from './service/container.mjs';
const localeService = container.resolve('localeService');

localeService.getLocales(); // list all available locales in config
console.log(localeService.getCurrentLocale()); // 'en'
localeService.setLocale('nl');

console.log(localeService.translate('ORG_404')); // check in locale folder
