import awilix from 'awilix';
import i18n from '../../config/i18n.config.js';
import { LocaleService } from './localeService.mjs';
const container = awilix.createContainer();
container
    .register({
        localeService: awilix.asClass(LocaleService, { lifetime: awilix.Lifetime.SINGLETON })
    })
    .register({
        i18nProvider: awilix.asValue(i18n)
    });
export default container;