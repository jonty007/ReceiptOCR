import { Router } from 'express';
import { isAuthenticated } from '../../middlewares';
import { User } from '../../db';

const users = Router();

/**
 * @api {get} /user/me Finds details of the logged in user
 * @apiName Find self user
 * @apiGroup User
 * @apiHeader {String} authorization Users unique access-key.
 * @apiHeader {String} Accept-Language language to get response for any messages from API. default to en (english)
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   "id": 1,
 *   "first_name": "Abc",
 *   "last_name": "Xyz",
 *   "email": "abc.xyz@demo.com",
 *   "profile_picture_file_id": 1,
 *   "user_type": "organization",
 *   "org_id": "1",
 *   "title": "Owner",
 *   "phone": "9876543210",
 *   "last_login_date": "2020-06-20T04:35:29.737Z",
 *   "login_attempts": 0,
 *   "stripe_customer_id": "jayr13nb23nk12b4",
 *   "stripe_card_id": "jayr13nb23nk12b4",
 *   "status": "active",
 *   "is_verified": true
 * }
 *
 */
users.get('/user/me', isAuthenticated(), async (req, res, next) => {
  try {
    const { user_id } = req.user;

    let user = await User.findOne({
      where: {
        id: user_id,
        deleted: false
      },
      include: [...User.getStandardInclude()]
    });

    return res.send(user);
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
 * @api {put} /user/me Update the logged in user
 * @apiName Update user profile
 * @apiGroup User
 * @apiHeader {String} authorization Users unique access-key.
 * @apiHeader {String} Accept-Language language to get response for any messages from API. default to en (english)
 *
 * @apiParam (Body) {String} first_name User First Name
 * @apiParam (Body) {String} last_name User Last Name
 * @apiParam (Body) {String} profile_picture_file_id Profile picture file ID of the user
 * @apiParam (Body) {String} title User Title/Designation
 * @apiParam (Body) {String} phone User Phone Number
 * @apiParam (Body) {String} stripe_customer_id User Stripe Customer ID
 * @apiParam (Body) {String} stripe_card_id User Stripe Card ID
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   "message": "Profile updated!"
 * }
 *
 * @apiError (Error 400) ValidationError Validation failed!
 * @apiError (Error 404) NotFoundError User not found!
 *
 */
users.put('/user/me', isAuthenticated(), async (req, res, next) => {
  try {
    const { user_id } = req.user,
      {
        first_name,
        last_name,
        profile_picture_file_id,
        title,
        phone,
        stripe_customer_id,
        stripe_card_id
      } = req.body;

    let user = await User.findOne({
      where: {
        id: user_id,
        deleted: false
      }
    });

    if (!user) {
      return res.status(404).send({
        message: 'USER_404'
      });
    }

    await User.update(
      {
        first_name,
        last_name,
        profile_picture_file_id,
        title,
        phone,
        stripe_customer_id,
        stripe_card_id,
        modified_by: user.id
      },
      {
        where: {
          id: user.id
        }
      }
    );

    return res.send({ message: 'PROFILE_UPD' });
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
 * @api {get} /user/all Finds all the users in system
 * @apiName Find all users
 * @apiGroup User
 * @apiHeader {String} authorization Users unique access-key.
 * @apiHeader {String} Accept-Language language to get response for any messages from API. default to en (english)
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   "count": 1,
 *   "rows": [{
 *     "id": 1,
 *     "first_name": "Abc",
 *     "last_name": "Xyz",
 *     "email": "abc.xyz@demo.com",
 *     "profile_picture_file_id": 1,
 *     "profilePicture": {
 *       "name": "Image",
 *       "extension": ".jpeg",
 *       "image_sizes": "",
 *       "file_size": "",
 *       "metadata": "",
 *       "mime_type": "",
 *       "location": "",
 *       "storage_type": "local",
 *       "content": ""
 *     },
 *     "user_type": "organization",
 *     "org_id": "1",
 *     "org": {
 *       "id": 1,
 *       "name": "Org 1",
 *       "org_type_id": 1,
 *       "orgType": {
 *         "name": "Org Type 1",
 *         "is_active": true
 *       },
 *       "email": "abc.xyz@demo.com"
 *     },
 *     "title": "Owner",
 *     "phone": "9876543210",
 *     "last_login_date": "2020-06-20T04:35:29.737Z",
 *     "login_attempts": 0,
 *     "stripe_customer_id": "jayr13nb23nk12b4",
 *     "stripe_card_id": "jayr13nb23nk12b4",
 *     "status": "active",
 *     "is_verified": true
 *   }]
 * }
 *
 * @apiError (Error 400) ValidationError Validation failed!
 * @apiError (Error 404) NotFoundError User not found!
 *
 */
users.get('/user/all', isAuthenticated(), async (req, res, next) => {
  try {
    let user = await User.findAndCountAll({
      where: {
        deleted: false
      },
      include: [...User.getStandardInclude()]
    });

    return res.send(user);
  } catch (e) {
    if (e.message) {
      return res.status(405).send({
        message: e.message
      });
    }
    return next(e);
  }
});

export default users;
