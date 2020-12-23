import { Router } from 'express';
import { isAuthenticated } from '../../middlewares';
import { Organization, User } from '../../db';
import { UserStatus, UserTypes as UserType } from '../../common/Mappings';
import { createJWT } from '../../common/auth.utils';
import { inviteNewUser } from '../../common/services/email';
import { createLink } from '../../boundaries/firebase';

const organization = Router();

// Get organization details
organization.get('/organization/:org_id', isAuthenticated(), async (req, res, next) => {
  try {
    let { org_id } = req.params;

    let org = await Organization.findOne({
      where: {
        id: org_id,
        deleted: false
      }
    });
    return res.send(org);
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
 * @api {put} /organization/:org_id  Updates the organization information
 * @apiName Update Organization
 * @apiGroup Organization
 * @apiHeader {String} authorization Users unique access-key.
 * @apiHeader {String} Accept-Language language to get response for any messages from API. default to en (english)
 *
 * @apiParam (Body) {String} [description] Description
 * @apiParam (Body) {Integer} [company_logo_file_id] File ID of the Company Logo
 * @apiParam (Body) {String} [email] Company Email
 * @apiParam (Body) {String} [phone] Company Phone number
 *
 * @apiParamExample  {json} Request-Example:
 * {
 *   "description": "This is a company",
 *   "company_logo_file_id": 1,
 *   "email": "abc.xyz@demo.com"
 *   "phone": "9876543210"
 * }
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   message: "Profile Updated!"
 * }
 *
 * @apiError (Error 400) ValidationError Validation failed!
 * @apiError (Error 404) NotFoundError Organization not found!
 *
 */
organization.put('/organization/:org_id', isAuthenticated(), async (req, res, next) => {
  try {
    let { org_id } = req.params,
      { actual_user_id } = req.user,
      {
        description,
        email,
        phone,
        street,
        zip,
        city,
        country,
        vat_number,
        contact_person_name,
        contact_person_number
      } = req.body;

    if (!org_id) {
      return res.status(400).send({
        message: 'VAL_FAILED'
      });
    }

    let org = await Organization.findOne({
      where: {
        id: org_id,
        deleted: false
      }
    });

    if (!org) {
      return res.status(404).send({
        message: 'ORG_404'
      });
    }

    await org.update({
      description,
      email,
      phone,
      street,
      zip,
      city,
      country,
      vat_number,
      contact_person_name,
      contact_person_number,
      modified_by: actual_user_id
    });

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
 * @api {get} /organization/all Returns list of all the organizations in the system
 * @apiName Find All Organizations
 * @apiGroup Organization
 * @apiHeader {String} authorization Users unique access-key.
 *
 * @apiSuccessExample {json} Success-Response:
 * [{
 *   "id": 1,
 *   "name": "Org 1",
 *   "description": "This is a company",
 *   "org_type_id": 1,
 *   "orgType: {
 *     "name": "Company",
 *     "is_active": true
 *   },
 *   "company_logo_file_id": 1,
 *   "email": "abc.xyz@demo.com,
 *   "phone": "9876543210",
 *   "is_active": true,
 *   "is_verified": true,
 *   "payment_id": 1,
 *   "subscription_id": 1,
 * }]
 *
 */
organization.get('/organization/all', isAuthenticated(), async (req, res, next) => {
  try {
    let organizationRecord = await Organization.findAndCountAll({
      where: {
        deleted: false
      },
      include: [...Organization.getMinimalInclude()]
    });

    return res.send(organizationRecord);
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
 * @api {post} /organization/:org_id/invite-user  Invite a new user to the organization
 * @apiName Invite New User To Org
 * @apiGroup Organization
 * @apiHeader {String} authorization Users unique access-key.
 * @apiHeader {String} Accept-Language language to get response for any messages from API. default to en (english)
 *
 * @apiParam (Params) {Number} org_id Organization ID
 * @apiParam (Body) {String} first_name First name of the inviting user
 * @apiParam (Body) {String} last_name Last name of the inviting user
 * @apiParam (Body) {String} email Email of the inviting user
 *
 * @apiParamExample  {json} Request-Example:
 * {
 *   "first_name": "Abc",
 *   "last_name": "Xyz,
 *   "email": "abc.xyz@demo.com"
 * }
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   message: "Invitation email has been sent to the user!"
 * }
 *
 * @apiError (Error 400) ValidationError Validation failed!
 * @apiError (Error 404) NotFoundError User not found!
 * @apiError (Error 404) NotFoundError Organization not found!
 * @apiError (Error 405) ProcessingError User already exists!
 *
 */
organization.post(
  '/organization/:org_id/invite-user',
  isAuthenticated(),
  async (req, res, next) => {
    try {
      const { org_id } = req.params,
        { user_id } = req.user,
        { first_name, last_name, email } = req.body;

      if (!org_id) {
        return res.status(400).send({
          message: 'VAL_FAILED'
        });
      }

      let orgDb = Organization.findOne({
          where: {
            id: org_id,
            deleted: false
          }
        }),
        userDb = User.findOne({
          where: {
            id: user_id,
            deleted: false
          },
          include: [...User.getStandardInclude()]
        });

      let [org, user] = await Promise.all([orgDb, userDb]);

      if (!user) {
        return res.status(404).send({
          message: 'USER_404'
        });
      }

      if (!org) {
        return res.status(404).send({
          message: 'ORG_404'
        });
      }

      if (!user.org) {
        return res.status(400).send({
          message: 'VAL_FAILED'
        });
      }

      if (user.org.id !== org_id && user.user_type !== UserType.ORGANIZATION_ADMIN) {
        return res.status(400).send({
          message: 'VAL_FAILED'
        });
      }

      let newUser = await User.findOne({
        where: {
          email,
          org_id,
          deleted: false
        }
      });

      if (newUser) {
        return res.status(405).send({
          message: 'USER_EXISTS'
        });
      }

      await User.create({
        email,
        first_name,
        last_name,
        org_id: org_id,
        user_type: UserType.ORGANIZATION_USER,
        status: UserStatus.VERIFICATION_PENDING,
        created_by: user_id,
        modified_by: user_id
      });

      const now = Date.now(),
        defaultTimeToExpire = now + 12 * 60 * 60 * 1000,
        encodeEmail = createJWT({
          data: { email, org_id, org_user: true },
          exp: defaultTimeToExpire
        });

      console.log('email: ', encodeEmail);
      let data = await createLink('createPassword', encodeEmail);
      await inviteNewUser.send({
        to: email,
        use_alias: true,
        subject_params: {
          invited_by_user_name: `${user.first_name} ${user.last_name}`
        },
        content_params: {
          name: `${first_name} ${last_name}`,
          invited_by_user_name: `${user.first_name} ${user.last_name}`,
          org_code: org.org_code,
          invitation_token: data.shortLink
        }
      });

      return res.send({ message: 'INV_MAIL_SUCCESS' });
    } catch (e) {
      if (e.message) {
        return res.status(405).send({
          message: e.message
        });
      }
      return next(e);
    }
  }
);

/**
 * @api {get} /organization/:ord_id/users Returns list of all users in an organization
 * @apiName Find all users in an organization
 * @apiGroup Organization
 * @apiHeader {String} authorization Users unique access-key.
 * @apiHeader {String} Accept-Language language to get response for any messages from API. default to en (english)
 *
 * @apiParam (Params) {Number} org_id Organization ID
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
 *     "user_type": "organization",
 *     "org_id": "1",
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
 * @apiError (Error 404) NotFoundError Organization not found!
 *
 */
organization.get('/organization/:org_id/users', isAuthenticated(), async (req, res, next) => {
  try {
    let { org_id } = req.params;

    if (!org_id) {
      return res.status(400).send({
        message: 'VAL_FAILED'
      });
    }

    let organizationDb = Organization.findOne({
        where: {
          id: org_id,
          deleted: false
        }
      }),
      usersDb = User.findAndCountAll({
        where: {
          org_id,
          deleted: false
        },
        include: [...User.getMinimalInclude()]
      });

    let [organizationRec, users] = await Promise.all([organizationDb, usersDb]);

    if (!organizationRec) {
      return res.status(404).send({
        message: 'ORG_404'
      });
    }

    return res.send(users);
  } catch (e) {
    if (e.message) {
      return res.status(405).send({
        message: e.message
      });
    }
    return next(e);
  }
});

export default organization;
