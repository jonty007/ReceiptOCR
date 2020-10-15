import { SubscriptionPlan, User, UserPassword } from '../../db';
import { UserStatus, UserTypes } from '../../common/Mappings';
import { createJWT } from '../../common/auth.utils';
import { createOrganization, addOrgCode } from '../organization/organization.service';
import { verifyNewUser } from '../../common/services/email';
import { Op } from 'sequelize';

const config = require('../../config'),
  request = require('request'),
  Promise = require('bluebird');

Promise.promisifyAll(request);

export async function signUpUser(data, transaction) {
  try {
    let { email, first_name, last_name, password, user_type } = data;

    const user = await User.findOne({
      where: {
        email,
        user_type: {[Op.ne]: UserTypes.ORGANIZATION_USER},
        deleted: false
      }
    });

    if (user) {
      throw new Error('User already exists!');
    }
    let org_details = null,
      isEmailVerificationRequired = true,
      status = UserStatus.VERIFICATION_PENDING,
      subscription_details = null,
      org_id = null;

    // if subscription plan has been selected & amount of plan > 0,
    // set status to payment pending for the user and do not send verification email
    if (data.subscription_plan_id) {
      subscription_details = await SubscriptionPlan.findOne({
        where: {
          id: data.subscription_plan_id,
          deleted: false
        }
      });

      if (!subscription_details) {
        throw new Error('Could not find the plan!');
      }

      if (subscription_details.amount) {
        status = UserStatus.PAYMENT_PENDING;
        isEmailVerificationRequired = false;
      }
    }

    const user_data = {
        email,
        first_name,
        last_name,
        org_id: org_id,
        user_type: user_type,
        status,
        // using 0 as system is creating this for the first time, can change according to need
        created_by: 0,
        modified_by: 0
      },
      dataForToken = {
        email
      };

    // create a new user
    let user_json = await User.create(user_data, { transaction });

    // user sign up for new org - create new org
    if (UserTypes.ORGANIZATION_ADMIN === data.user_type) {
      org_details = await createOrganization(
        { name: data.organization },
        { user_id: user_json.id },
        transaction
      );

      org_id = org_details.org_details.id;
      let org_code = '' + org_id;
      while (org_code.length < 6) {
        org_code = '0' + org_code;
      }
      await addOrgCode({org_id: org_id, org_code: org_code}, { user_id: user_json.id }, transaction);

      dataForToken.org_name = org_details.org_details.name;
    }

    let password_params = {
      user_id: user_json.id,
      password,
      created_by: user_json.id,
      modified_by: user_json.id
    };

    await UserPassword.create(password_params, { transaction });
    await User.update(
      {
        org_id: org_id
      },
      {
        where: {
          id: user_json.id
        },
        transaction
      }
    );

    // for the token to send in email link
    if (isEmailVerificationRequired) {
      const now = Date.now(),
        defaultTimeToExpire = now + 12 * 60 * 60 * 1000,
        encodeEmail = createJWT({
          data: dataForToken,
          exp: defaultTimeToExpire
        });

      await verifyNewUser.send({
        to: email,
        use_alias: true,
        subject_params: {},
        content_params: {
          name: `${first_name} ${last_name}`,
          invitation_token: encodeEmail
        }
      });
    }

    return {
      user_json
    };
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function validateAccessToken(body) {
  let headers = {
    Authorization: `Bearer ${body.accessToken}`
  };
  return request.getAsync({
    url: `${config.azure.baseGraphURL}${config.azure.userInfo}`,
    headers: headers
  });
}
