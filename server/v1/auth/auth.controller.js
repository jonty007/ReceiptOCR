import { Router } from 'express';

import { Organization, sequelize, User, UserPassword } from '../../db';
import { UserStatus, UserTypes } from '../../common/Mappings';
import {
  forgotEmail,
  inviteNewUser,
  welcomeEmail,
  verifyNewUser
} from '../../common/services/email';
import { signUpUser, validateAccessToken } from './auth.service';
import { createJWT, decodeJWT } from '../../common/auth.utils';
import { Op } from 'sequelize';
import { createLink } from '../../boundaries/firebase';

const auth = Router();
const MAX_LOGIN_ATTEMPTS = 3;

/**
 * @api {post} /auth/sign-up Adds new user to system (with or without organization)
 * @apiName Sign Up
 * @apiGroup Auth
 *
 * @apiHeader {String} Accept-Language language to get response for any messages from API. default to en (english)
 *
 * @apiVersion  1.0.0
 *
 * @apiParam (Body) {String} email Email to register
 * @apiParam (Body) {String} first_name User First Name
 * @apiParam (Body) {String} last_name User Last Name
 * @apiParam (Body) {String} password New User Password
 * @apiParam (Body) {String} confirm_password Confirm New User Password
 * @apiParam (Body) {Integer} [subscription_plan_id] Plan User subscribes to
 * @apiParam (Body) {Integer} [org_type_id] Type of Organization being registered (optional for 'individual' and mandatory for 'organization' org type)
 * @apiParam (Body) {String} user_type Type of User (values: 'individual', 'organization')
 * @apiParam (Body) {String} [organization] Name of new organization
 *
 *
 * @apiParamExample  {json} Request-Example:
 * {
 *   "first_name": "ABC",
 *   "last_name": "XYZ",
 *   "email": "abc.xyz@demo.in",
 *   "password": "123",
 *   "confirm_password": "123",
 *   "subscription_plan_id": 1,
 *   "user_type": "individual"
 * }
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   "message" : 'User created!'
 * }
 *
 * @apiError (Error 400) ValidationError Validation failed!
 * @apiError (Error 400) ValidationError Passwords don't match
 * @apiError (Error 400) ValidationError Organization name is mandatory
 * @apiError (Error 405) ProcessingError User already exists!
 * @apiError (Error 405) NotFoundError Could not find the plan!
 * @apiError (Error 405) ProcessingError Organization already exists!
 *
 */
auth.post('/auth/sign-up', async (req, res, next) => {
  try {
    const {
      email,
      first_name,
      last_name,
      password,
      subscription_plan_id,
      confirm_password,
      org_type_id,
      user_type,
      organization
    } = req.body;

    if (!email || !first_name || !last_name) {
      return res.status(400).send({ message: 'VAL_FAILED' });
    }
    if (password !== confirm_password) {
      return res.status(400).send({ message: 'PASSWORD_NO_MATCH' });
    }
    if ((UserTypes.ORGANIZATION_ADMIN === user_type) && !organization) {
      return res.status(400).send({ message: 'ORG_MANDATORY' });
    }
    let user;
    await sequelize.transaction(async transaction => {
      user = await signUpUser(
        {
          email,
          first_name,
          last_name,
          password,
          subscription_plan_id,
          confirm_password,
          org_type_id,
          user_type,
          organization
        },
        transaction
      );
    });

    return res.send({ message: 'USER_CREATED', user: user.user_json });
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
 * @api {post} /auth/verify-user Verifies the user email after signup
 * @apiName Verify user email
 * @apiGroup Auth
 *
 * @apiHeader {String} Accept-Language language to get response for any messages from API. default to en (english)
 *
 * @apiParam (Body) {String} code The code token received in the mail
 *
 * @apiParamExample  {json} Request-Example:
 * {
 *   "code": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE1OTI0MzYxOTMyNDgsImV4cCI6MTU5MjQ3OTM5MzI0OCwiZW1haWwiOiJzYW1iaGF2Lm1hbGhvdHJhQHF1YW50ZW9uLmluIn0.Qn9HkTvTZel-izJquyynwb7wMrSQ1Sb6Q6b2lmto6rgo7RspIhE777w-8T-Ey3yV8S4OHRfAy6FVmGuSxtfsiA"
 * }
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   "message" : 'User verified!'
 * }
 *
 * @apiError (Error 400) ValidationError Link has expired!
 * @apiError (Error 400) ValidationError Invalid link
 * @apiError (Error 404) NotFoundError User not found
 * @apiError (Error 404) NotFoundError Organization not found!  // If org admin calls the API
 * @apiError (Error 405) ProcessingError Invalid details for the user!
 * @apiError (Error 405) ProcessingError User is either already active or deleted!
 *
 *
 */
auth.post('/auth/verify-user', async (req, res, next) => {
  try {
    let { code } = req.body;

    if (!code) {
      return res.status(400).send({
        message: 'VAL_FAILED'
      });
    }

    let decodedObj;
    try {
      decodedObj = decodeJWT({
        token: code
      });
    } catch (error) {
      return res.status(400).send({ message: 'LINK_EXPIRED' });
    }
    console.log('decodedObj: ', decodedObj);

    if (!decodedObj.email) {
      return res.status(400).send({
        message: 'INVALID_LINK'
      });
    }

    let user = null, org;

    if (decodedObj.org_id && decodedObj.org_user) {
      // verification for org users
      user = await User.findOne({
        where: {
          email: decodedObj.email,
          org_id: decodedObj.org_id,
          deleted: false
        },
        include: [...User.getPasswordInclude()]
      });
    } else {
      // verfication  of main users
      user = await User.findOne({
        where: {
          email: decodedObj.email,
          user_type: {[Op.ne]: UserTypes.ORGANIZATION_USER},
          deleted: false
        },
        include: [...User.getPasswordInclude()]
      });
    }

    if (!user) {
      return res.status(404).send({
        message: 'USER_404'
      });
    }

    if (!user.password) {
      return res.status(405).send({
        message: 'USER_INVALID_DET'
      });
    }

    if (UserStatus.VERIFICATION_PENDING !== user.status) {
      return res.status(405).send({
        message: 'USER_ACTIVE_OR_DELETE'
      });
    }

    if (decodedObj.org_name) {
      org = await Organization.findOne({
        where: {
          name: decodedObj.org_name,
          deleted: false
        }
      });

      if (!org) {
        return res.status(404).send({
          message: 'ORG_404'
        });
      }
    }

    await sequelize.transaction(async transaction => {
      await User.update(
        {
          status: UserStatus.ACTIVE,
          is_verified: true,
          modified_by: user.id
        },
        {
          where: {
            id: user.id
          },
          transaction
        }
      );

      if (org) {
        await Organization.update(
          {
            is_active: true,
            is_verified: true,
            modified_by: user.id
          },
          {
            where: {
              id: org.id
            },
            transaction
          }
        );
      }
    });

    await welcomeEmail.send({
      to: user.email,
      use_alias: true,
      subject_params: {},
      content_params: {
        name: `${user.first_name} ${user.last_name}`
      }
    });

    return res.send({ message: 'USER_VERIFY' });
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
 * @api {post} /auth/login Login
 * @apiName User login
 * @apiGroup Auth
 *
 * @apiHeader {String} Accept-Language language to get response for any messages from API. default to en (english)
 *
 * @apiParam (Body) {String} email User email
 * @apiParam (Body) {String} password Password
 *
 * @apiParamExample  {json} Request-Example:
 * {
 *   "email": "abc.xyz@demo.in"
 *   "password": "123"
 * }
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   token,  // JWT token of the user logging in
 *   user: {
 *      id,  // Logged in user/user being simulated
 *      actual_user_id   // Logged in user id
 *   }
 * }
 *
 * @apiError (Error 400) ValidationError Validation failed!
 * @apiError (Error 400) ValidationError Invalid Email or Password.
 * @apiError (Error 400) ValidationError User is not active.
 * @apiError (Error 403) UnauthorizedError Your account has been locked. Please contact administrator!   // after 3 incorrect password attempts
 * @apiError (Error 405) ProcessingError Account is still not active!
 * @apiError (Error 405) ProcessingError Invalid Password! You have <attempts_left> attempt(s) left.
 *
 */
auth.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password, org_code } = req.body;

    if (!email || !password) {
      return res.status(400).send({ message: 'VAL_FAILED' });
    }

    let org = null;

    if (org_code) {
      org = await Organization.findOne({
        where: {
          org_code,
          deleted: false
        }
      });
    }

    let user = null;
    if (org) {
      user = await User.findOne({
        where: {
          email,
          org_id: org.id,
          deleted: false
        }
      });
    } else {
      user = await User.findOne({
        where: {
          email,
          deleted: false
        }
      });
    }

    if (!user) {
      return res.status(400).send({ message: 'LOGIN_ERROR' });
    }
    
    if (UserStatus.PAYMENT_PENDING === user.status) {
      return res.status(400).send({ message: 'PAYMENT_PENDING' });
    }

    if (!user.is_verified || UserStatus.ACTIVE !== user.status) {
      return res.status(400).send({ message: 'USER_NOT_ACTIVE' });
    }

    // if user has reached limit of 3 attempts, restrict login
    if (user.login_attempts >= MAX_LOGIN_ATTEMPTS) {
      return res.status(403).send({ message: 'USER_LOCKED' });
    }

    const user_pass = await UserPassword.findOne({ where: { user_id: user.id, deleted: false } });

    // Missing password case
    if (!user_pass) {
      return res.status(405).send({ message: 'USER_STILL_NOT_ACTIVE' });
    }

    if (!(await user_pass.comparePassword(password))) {
      // on failed login, update login attempt counter
      await User.update(
        {
          login_attempts: user.login_attempts + 1,
          modified_by: user.id
        },
        {
          where: {
            id: user.id
          }
        }
      );
      return res.status(401).send({
        message: {
          code: 'LOGIN_PASSWORD_ERROR %s',
          replace: `${MAX_LOGIN_ATTEMPTS - user.login_attempts - 1}`
        }
      });
    }

    const {
      token,
      user: { id }
    } = await user.createTokenResponse({ actual_user_id: user.id }); // actual_user_id should be same as user id here

    // reset counter after every successful login and capture last login date
    await User.update(
      {
        login_attempts: 0,
        last_login_date: Date.now(),
        modified_by: user.id
      },
      {
        where: {
          id: user.id
        }
      }
    );

    return res.send({ token, user: { id, actual_user_id: id } });
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
 * @api {post} /auth/forgot-password ForgotPassword
 * @apiName Forgot password
 * @apiGroup Auth
 *
 * @apiHeader {String} Accept-Language language to get response for any messages from API. default to en (english)
 *
 * @apiParam (Body) {String} email User email
 *
 * @apiParamExample  {json} Request-Example:
 * {
 *   "email": "abc.xyz@demo.in"
 * }
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   message: "Email sent to registered mail!"
 * }
 *
 * @apiError (Error 400) ValidationError Validation failed!
 * @apiError (Error 400) NotFoundError User not found!
 * @apiError (Error 400) ValidationError User has not completed the registration or is not active!
 *
 */
auth.post('/auth/forgot-password', async (req, res, next) => {
  try {
    const { email, org_code } = req.body;

    if (!email) {
      return res.status(400).send({ message: 'VAL_FAILED' });
    }

    let user = null;
    if (org_code) {
      let org = await Organization.findOne({
        where: {
          org_code,
          deleted: false
        }
      });

      user = await User.findOne({ where: { email, org_id: org.id, deleted: false } });

    } else {
      user = await User.findOne({ where: { email, deleted: false } });
    }

    const now = Date.now(),
      defaultTimeToExpire = now + 12 * 60 * 60 * 1000;

    if (!user) {
      return res.status(404).send({
        message: 'USER_404'
      });
    }

    if (!user.is_verified || UserStatus.ACTIVE !== user.status) {
      return res.status(400).send({
        message: 'USER_NOT_REGISTERED'
      });
    }

    let encodeUserId = createJWT({
      data: { id: user.id },
      exp: defaultTimeToExpire
    });
    
    let data = await createLink('resetPassword', encodeUserId);
    forgotEmail
      .send({
        to: user.email,
        content_params: {
          name: `${user.first_name} ${user.last_name}`,
          reset_code: data.shortLink
        }
      })
      .catch(() => {}); // ignore if email fails?

    // Send success regardless of results
    // This ensures that user doesn't know if the email has a valid user account
    return res.send({ message: 'EMAIL_SENT' });
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
 * @api {post} /auth/reset-password Reset Password
 * @apiName Reset password
 * @apiGroup Auth
 *
 * @apiHeader {String} Accept-Language language to get response for any messages from API. default to en (english)
 *
 * @apiParam (Body) {String} password New Password
 * @apiParam (Body) {String} confirm Confirm New Password
 * @apiParam (Body) {String} reset_code Reset Code from email
 *
 * @apiParamExample  {json} Request-Example:
 * {
 *   "password": "123"
 *   "confirm": "123"
 *   "reset_code": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE1OTE5MDg1MTMyNTUsImV4cCI6MTU5MTk1MTcxMzI1NSwiaWQiOjJ9.2NuRPEvHr_Jx3PvbjgtjD6sV3RT0PNIfSgqazuq52wrPlsmD4IC_tuIj8O8R9A0RqhdoBXhVFz8H8GKwU7PMUg"
 * }
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   message: "Password has been reset!"
 * }
 *
 * @apiError (Error 400) ValidationError Validation failed!
 * @apiError (Error 400) ValidationError Password and confirmation do not match!
 * @apiError (Error 400) ValidationError Link has expired!
 * @apiError (Error 400) ValidationError Invalid link!
 * @apiError (Error 400) ValidationError New password cannot be same as last 3 passwords!
 *
 */
auth.post('/auth/reset-password', async (req, res, next) => {
  try {
    const { password, confirm, reset_code } = req.body;

    if (!password || !confirm || !reset_code) {
      return res.status(400).send({ message: 'VAL_FAILED' });
    }

    if (password !== confirm) {
      return res.status(400).send({ message: 'PASS_NO_MATCH' });
    }

    let decodedObj;
    try {
      decodedObj = decodeJWT({
        token: reset_code
      });
    } catch (error) {
      return res.status(400).send({ message: 'LINK_EXPIRED' });
    }

    if (!decodedObj.id) {
      return res.status(400).send({
        message: 'INVALID_LINK'
      });
    }

    const user_id = decodedObj.id,
      user_passwords = await UserPassword.findAll({
        where: { user_id },
        paranoid: false,
        order: [['created_at', 'DESC']],
        limit: 3 // to get last 3 passwords of that user
      }),
      [current_pass] = user_passwords;

    let isMatchedWithPrev3Pass = false;
    for (const user_pass of user_passwords) {
      if (await user_pass.comparePassword(password)) {
        isMatchedWithPrev3Pass = true;
        break;
      }
    }

    if (isMatchedWithPrev3Pass) {
      return res.status(405).send({
        message: 'PASSWORD_VALIDATION'
      });
    }

    const params = {
      user_id,
      password,
      created_by: user_id,
      modified_by: user_id
    };

    await sequelize.transaction(async transaction => {
      // update old passwords deleted to true
      if (current_pass) {
        await current_pass.update(
          { modified_by: user_id, deleted: true, deleted_at: Date.now() },
          { transaction }
        );
      }

      // create new password
      await UserPassword.create(params, { transaction });
    });

    return res.send({ message: 'PASSWORD_RESET' });
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
 * @api {post} /auth/create-password CreatePassword
 * @apiName Create password for new user (for invited user)
 * @apiGroup Auth
 *
 * @apiHeader {String} Accept-Language language to get response for any messages from API. default to en (english)
 *
 * @apiParam (Body) {String} invitation_code Invitation Code from email
 * @apiParam (Body) {String} password New Password
 * @apiParam (Body) {String} confirm Confirm New Password
 *
 * @apiParamExample  {json} Request-Example:
 * {
 *   "invitation_code": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpYXQiOjE1OTE5MTIxMzY1NDYsImV4cCI6MTU5MTk1NTMzNjU0NiwiZW1haWwiOiJzYW1iaGF2Lm1hbGhvdHJhKzdAcXVhbnRlb24uaW4ifQ.s_Zufa1felBNGlyxaYfB13ZXCaZCTwO9oBQF6xchY5A54Zm3iflSGSRkw64ty9l26R2i9akPtz3JUWTmmIhG0g"
 *   "password": "123"
 *   "confirm": "123"
 * }
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   message: "Password created!"
 * }
 *
 * @apiError (Error 400) ValidationError Validation failed!
 * @apiError (Error 400) ValidationError Link has expired!
 * @apiError (Error 400) ValidationError Password and confirmation do not match!
 * @apiError (Error 400) ValidationError User with this email is deleted or does not exists!
 * @apiError (Error 400) ValidationError User is either already verified or was deleted!
 *
 */
auth.post('/auth/create-password', async (req, res, next) => {
  try {
    const { invitation_code, password, confirm } = req.body;

    if (!invitation_code || !password || !confirm) {
      return res.status(400).send({
        message: 'VAL_FAILED'
      });
    }

    let decodedObj;
    try {
      decodedObj = decodeJWT({
        token: invitation_code
      });
    } catch (error) {
      return res.status(400).send({ message: 'LINK_EXPIRED' });
    }

    if (!decodedObj.email) {
      return res.status(400).send({
        message: 'INVALID_LINK'
      });
    }

    if (password !== confirm) {
      return res.status(400).send({
        message: 'PASSWORD_NO_MATCH'
      });
    }

    let user = null;
    console.log("decoded obj: ", decodedObj);
    if (decodedObj.org_id && decodedObj.org_user) {
      // verification for org users
      user = await User.findOne({
        where: {
          email: decodedObj.email,
          org_id: decodedObj.org_id,
          deleted: false
        },
        include: [...User.getPasswordInclude()]
      });
    } else {
      // verfication  of main users
      user = await User.findOne({
        where: {
          email: decodedObj.email,
          user_type: {[Op.ne]: UserTypes.ORGANIZATION_USER},
          deleted: false
        },
        include: [...User.getPasswordInclude()]
      });
    }

    if (!user) {
      return res.status(400).send({
        message: 'USER_NOT_EXISTS'
      });
    }

    if (UserStatus.VERIFICATION_PENDING !== user.status) {
      return res.status(400).send({
        message: 'USERS_EXISTS_DEL'
      });
    }

    let user_params = {
        status: UserStatus.ACTIVE,
        is_verified: true,
        modified_by: user.id
      },
      password_params = {
        user_id: user.id,
        password,
        created_by: user.id,
        modified_by: user.id
      };

    await sequelize.transaction(async transaction => {
      await UserPassword.create(password_params, { transaction });

      // Update status and mark verified true
      await User.update(user_params, {
        where: {
          id: user.id
        },
        transaction
      });

      await welcomeEmail.send({
        to: user.email,
        use_alias: true,
        subject_params: {},
        content_params: {
          name: `${user.first_name} ${user.last_name}`
        }
      });
    });

    return res.send({ message: 'PASSWORD_CREATED' });
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
 * @api {post} /auth/resend-verification-link ResendVerificationLink
 * @apiName Resend Verification Link
 * @apiGroup Auth
 *
 * @apiHeader {String} Accept-Language language to get response for any messages from API. default to en (english)
 *
 * @apiParam (Body) {String} email User email
 *
 * @apiParamExample  {json} Request-Example:
 * {
 *   "email": "abc.xyz@demo.com"
 * }
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   message: "Verification email sent again!"
 * }
 *
 * @apiError (Error 400) ValidationError Validation failed!
 * @apiError (Error 400) ValidationError User with this email is deleted or does not exists!
 * @apiError (Error 400) ValidationError User is either already verified or was deleted!
 * @apiError (Error 404) NotFoundError Could not find organization!
 *
 */
auth.post('/auth/resend-verification-link', async (req, res, next) => {
  try {
    const { email, org_code } = req.body;

    if (!email) {
      return res.status(400).send({
        message: 'VAL_FAILED'
      });
    }

    let user = await User.findOne({
      where: {
        email,
        user_type: {[Op.ne]: UserTypes.ORGANIZATION_USER},
        deleted: false
      },
      include: [...User.getStandardInclude()]
    });

    if (!user) {
      return res.status(400).send({
        message: 'USER_NOT_EXISTS'
      });
    }

    if (UserStatus.VERIFICATION_PENDING !== user.status) {
      return res.status(400).send({
        message: 'USERS_EXISTS_DEL'
      });
    }

    let emailObj = { email },
      invitingUser;

    if (UserTypes.ORGANIZATION_ADMIN === user.user_type) {
      if (!user.org) {
        return res.status(404).send({
          message: 'ORG_NOT_FOUND'
        });
      }

      if (!user.org.is_verified) {
        emailObj.org_name = user.org.name;
        if (user.created_by) {
          invitingUser = await User.find({
            where: {
              id: user.created_by
            }
          });
        }
      }
    }

    const now = Date.now(),
      defaultTimeToExpire = now + 12 * 60 * 60 * 1000,
      encodeEmail = createJWT({
        data: emailObj,
        exp: defaultTimeToExpire
      });

    if (invitingUser) {
      let data = await createLink('createPassword', encodeEmail);
      await inviteNewUser.send({
        to: email,
        use_alias: true,
        subject_params: {
          invited_by_user_name: `${invitingUser.first_name} ${invitingUser.last_name}`
        },
        content_params: {
          name: `${user.first_name} ${user.last_name}`,
          invited_by_user_name: `${invitingUser.first_name} ${invitingUser.last_name}`,
          invitation_token: data.shortLink
        }
      });
    } else {
      let data = await createLink('verifyAccount', encodeEmail);
      await verifyNewUser.send({
        to: email,
        use_alias: true,
        subject_params: {},
        content_params: {
          name: `${user.first_name} ${user.last_name}`,
          invitation_token: data.shortLink
        }
      });
    }

    return res.send({ message: 'VER_MAIL' });
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
 * @api {post} /auth/azurelogin Azure SSO Login
 * @apiName Azure SSO Login
 * @apiGroup Auth
 *
 * @apiHeader {String} Accept-Language language to get response for any messages from API. default to en (english)
 *
 * @apiParam (Body) {String} access_token
 * @apiParam (Body) {String} refresh_token
 * @apiParam (Body) {String} id_token
 *
 * @apiParamExample  {json} Request-Example:
 * {
 *   "access_token": "****token****"
 *   "refresh_token": "****token****"
 *   "id_token": "****token****"
 * }
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   token,  // JWT token of the user logging in
 *   user: {
 *      id,  // Logged in user/user being simulated
 *      actual_user_id,   // Logged in user id
 *      display_name,
 *      first_name,
 *      last_name,
 *      email
 *   }
 * }
 *
 * @apiError (Error 400) ValidationError Validation failed!
 * @apiError (Error 400) Invalid Access Token.
 *
 */
auth.post('/auth/azurelogin', async (req, res, next) => {
  try {
    const { access_token, id_token, refresh_token } = req.body;
    if (!access_token || !id_token || !refresh_token) {
      return res.status(400).send({ message: res.translate('VAL_FAILED') });
    }

    const validation_response = await validateAccessToken({ accessToken: access_token });

    if (validation_response.statusCode !== 200) {
      return res.status(400).send({ message: 'INVALID_TOKEN' });
    }

    const user_info = JSON.parse(validation_response.body);

    let user = {
      id: user_info.id,
      actual_user_id: user_info.id,
      display_name: user_info.displayName,
      first_name: user_info.givenName,
      last_namae: user_info.surname,
      email: user_info.mail
    };

    let token = createJWT({
      data: {
        user,
        tokens: {
          access_token,
          id_token,
          refresh_token
        }
      }
    });

    return res.send({
      token,
      user: user,
      message: 'USER_LOGIN_SUCCESS',
      status: true,
      statusCode: 200
    });
  } catch (e) {
    if (e.message) {
      return res.status(405).send({
        message: e.message
      });
    }
    return next(e);
  }
});

export default auth;
