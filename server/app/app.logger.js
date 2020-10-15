import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import { env, logLevel, name } from '../config';

const appLabel = `${name}(${env})`,
  { combine, colorize, timestamp, label, printf } = format,
  /* TODO : winston-daily-rotate-file
   */

  customFormat = ({ stringify = false } = {}) =>
    printf(info => {
      const pre_message = `${info.timestamp} ${info.label} ${info.level}:`,
        { message } = info;

      if (info.object) {
        if (stringify) {
          return `${pre_message} \n${JSON.stringify(message, null, 2)}`;
        }
        return `${pre_message} \n${message}`;
      }

      return `${pre_message} ${message}`;
    }),
  enumerateErrorFormat = format(info => {
    if (info.message instanceof Error) {
      info.message = Object.assign(
        {
          message: info.message.stack
        },
        info.message
      );
      info.messageError = true;
    }

    if (info instanceof Error) {
      info.messageError = true;
      return Object.assign(
        {
          message: info.stack
        },
        info
      );
    }

    if (info.message instanceof Object) {
      info.object = true;
    }

    return info;
  });

export const logger = createLogger({
  level: logLevel,
  format: enumerateErrorFormat(),
  transports: [
    new transports.DailyRotateFile({
      filename: 'App-Server-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false, // keep false, this allows older files to be deleted
      maxSize: '20m',
      maxFiles: '5',
      dirname: './logs',
      // NOTE: Do not use colorize file transport to avoid special characters
      format: combine(
        label({
          label: appLabel
        }),
        timestamp(),
        customFormat({
          stringify: true
        })
      )
    }),
    new transports.Console({
      // format: combine(printf(info => info.message))
      format: combine(
        label({ label: appLabel }),
        timestamp(),
        colorize({ all: true }),
        // NOTE: Do not stringify objects as colorize does it
        customFormat({ stringify: false })
      )
    })
  ]
});

logger.info('Logger is initialized');
