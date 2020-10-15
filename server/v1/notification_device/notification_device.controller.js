import { Router } from 'express';
import { isAuthenticated } from '../../middlewares';
import { NotificationDevice } from '../../db';
import { NotificationDevicePlatform } from '../../common/Mappings';

const notification_device = Router();

/**
 * @api {post} /devices Register a new device for a user
 * @apiName Register a new device
 * @apiGroup Notification Device
 * @apiHeader {String} authorization Users unique access-key.
 *
 * @apiParam (Body) {String} registration_id Device registration ID
 * @apiParam (Body) {String} uuid Device UUID
 * @apiParam (Body) {String="iOS","Android"} platform Device Platform
 *
 * @apiParamExample  {json} Request-Example:
 * {
 *   "registration_id": "jhvv@#%$%112e1gvhj1341",
 *   "uuid": "MMA2QA&7H765",
 *   "platform": "iOS"
 * }
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   message: "Device added!"
 * }
 *
 * @apiError (Error 400) ValidationError Validation failed!
 *
 */
notification_device.post('/devices', isAuthenticated(), async (req, res, next) => {
  try {
    let { registration_id, uuid, platform } = req.body,
      { actual_user_id, user_id } = req.user;

    if (
      !registration_id ||
      !uuid ||
      !platform ||
      (NotificationDevicePlatform.IOS !== platform &&
        NotificationDevicePlatform.ANDROID !== platform)
    ) {
      return res.status(400).send({
        message: 'VAL_FAILED'
      });
    }

    let notification_device_params = {
      registration_id,
      uuid,
      platform,
      is_active: true,
      user_id: user_id,
      created_by: actual_user_id,
      modified_by: actual_user_id
    };

    await NotificationDevice.create(notification_device_params);

    return res.send({ message: 'DEVICE_ADDED' });
  } catch (e) {
    if (e.message) {
      return res.status(405).send({
        message: e.message
      });
    }
    return next(e);
  }
});

/**
 * @api {get} /devices/user-devices Get all devices for the logged in user
 * @apiName Get logged in user devices
 * @apiGroup Notification Device
 * @apiHeader {String} authorization Users unique access-key.
 *
 * @apiParam (Body) {String} registration_id Device registration ID
 * @apiParam (Body) {String} uuid Device UUID
 * @apiParam (Body) {String} platform Device Platform  // accepted values: 'iOS'/'Android'
 *
 * @apiSuccessExample {json} Success-Response:
 * [{
 *   "id": 1,
 *   "user_id": 1,
 *   "registration_id": "jhvv@#%$%112e1gvhj1341",
 *   "uuid": "MMA2QA&7H765",
 *   "platform": "iOS",
 *   "is_active": true
 * }]
 *
 * @apiError (Error 400) ValidationError Validation failed!
 *
 */
notification_device.get('/devices/user-devices', isAuthenticated(), async (req, res, next) => {
  try {
    let { user_id } = req.user;

    let devices = await NotificationDevice.findAndCountAll({
      where: {
        user_id,
        deleted: false
      }
    });

    return res.send(devices);
  } catch (e) {
    if (e.message) {
      return res.status(405).send({
        message: e.message
      });
    }
    return next(e);
  }
});

/**
 * @api {delete} /devices/remove-device Remove an existing device for a user
 * @apiName Remove an existing device
 * @apiGroup Notification Device
 * @apiHeader {String} authorization Users unique access-key.
 *
 * @apiParam (Body) {String} registration_id Device registration ID
 * @apiParam (Body) {String} uuid Device UUID
 * @apiParam (Body) {String} platform Device Platform  // accepted values: 'iOS'/'Android'
 *
 * @apiParamExample  {json} Request-Example:
 * {
 *   "registration_id": "jhvv@#%$%112e1gvhj1341",
 *   "uuid": "MMA2QA&7H765",
 *   "platform": "iOS"
 * }
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   "message": "Device removed!"
 * }
 *
 * @apiError (Error 400) ValidationError Validation failed!
 * @apiError (Error 404) NotFoundError Device not found!
 *
 */
notification_device.post('/devices/remove-device', isAuthenticated(), async (req, res, next) => {
  try {
    let { registration_id, uuid } = req.body,
      { actual_user_id, user_id } = req.user;

    if (!registration_id || !uuid) {
      return res.status(400).send({
        message: 'VAL_FAILED'
      });
    }

    let device = await NotificationDevice.findOne({
      where: {
        registration_id,
        uuid,
        user_id,
        is_active: true,
        deleted: false
      }
    });

    if (!device) {
      return res.status(404).send({
        message: 'DEVICE_404'
      });
    }

    await device.update({
      is_active: false,
      deleted: true,
      deleted_at: Date.now(),
      modified_by: actual_user_id
    });

    return res.send({ message: 'DEVICE_203' });
  } catch (e) {
    if (e.message) {
      return res.status(405).send({
        message: e.message
      });
    }
    return next(e);
  }
});

export default notification_device;
