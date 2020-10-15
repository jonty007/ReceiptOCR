import cron from 'cron';
import { logger } from '../../app/app.logger';

export function createNotificationCron() {
  const {
    sendNotificationToUser
  } = require('../../v1/maintenance/notifications/notifications.service');

  return new cron.CronJob(
    '* * * * *',
    () => {
      sendNotificationToUser().catch(logger.error);
    },
    null, // onComplete
    false, // auto start
    'America/Chicago' // time zone
  );
}
