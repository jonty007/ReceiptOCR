import { Organization, Payment, SubscriptionPlan, User } from '../../db';
import { UserStatus } from '../../common/Mappings';
import { verifyNewUser } from '../../common/services/email';
import { createJWT } from '../../common/auth.utils';
import { logger } from '../../app/app.logger';
import { client } from '../../boundaries/stripe';
import { createLink } from '../../boundaries/firebase';

async function createStripeCustomer(email, user_details) {
  console.log(client);
  let customer_details = await client.customers.create({
    email: email,
    name: user_details.first_name + ' ' + user_details.last_name
  });
  return customer_details.id;
}

async function createStripePayment(payment_details, user, transaction) {
  // return {};
  try {
    let { token, card, subscription_plan_id } = payment_details,
      { user_id } = user,
      stripe_details = null,
      user_details = null,
      customer_id = null,
      card_id = null;
    if (!card) {
      throw new Error('Validation Error');
    }

    user_details = await User.findOne({
      where: {
        id: user_id
      }
    });

    if (!user_details) {
      throw new Error('Invalid User');
    }

    if (!user_details.stripe_customer_id) {
      user_details.stripe_customer_id = await createStripeCustomer(user_details.email, user_details);
      customer_id = user_details.stripe_customer_id;
    } else {
      customer_id = user_details.stripe_customer_id;
    }
    let plan_details = await SubscriptionPlan.findOne({
      where: {
        id: subscription_plan_id,
        deleted: false
      }
    });

    if (!payment_details.token && payment_details.card) {
      stripe_details = await client.tokens.create({ card: payment_details.card });
      console.log('stripe_details: ', stripe_details);
      token = stripe_details.id;
      card_id = stripe_details.card.id;
    }

    let source_res = await client.customers.createSource(customer_id, { source: token });
    console.log('source_res: ', source_res);
    let results = await client.subscriptions.create({
      customer: customer_id,
      items: [
        {
          price: plan_details.stripe_subscription_price
        }
      ]
    });
    return { customer_id, card_id, source_id: source_res.id, subscription_id: results.id };
  } catch (error) {
    throw new Error(error);
  }
}

export async function createPayment(payment_details, transaction) {
  try {
    let { user_id, subscription_plan_id, payment_type } = payment_details;
    let user_details = await User.findOne({ where: { id: user_id } }, transaction);
    let subscription_details = await createStripePayment(payment_details, { user_id }, transaction);
    let { card_id, customer_id, subscription_id, source_id } = subscription_details;
    if (user_details.status === UserStatus.VERIFICATION_PENDING) {
      throw new Error('Invalid');
    }

    let payment_params = {
      user_id: user_id,
      stripe_customer_id: customer_id,
      source_id: source_id,
      stripe_card_id: card_id,
      subscription_plan_id: subscription_plan_id,
      payment_type: payment_type,
      created_by: user_id,
      modified_by: user_id
    };
    let payment = await Payment.create(payment_params, transaction);
    await Organization.update(
      {
        payment_id: payment.id,
        subscription_id: subscription_id,
        modified_by: user_id
      },
      { transaction, where: { id: user_details.org_id } }
    );

    await User.update(
      {
        status: UserStatus.VERIFICATION_PENDING,
        stripe_card_id: subscription_details.card_id,
        stripe_customer_id: subscription_details.customer_id,
        subscription_plan: subscription_plan_id,
        subscription_id: subscription_id,
        modified_by: user_id
      },
      { transaction, where: { id: user_details.id } }
    );

    const now = Date.now(),
      defaultTimeToExpire = now + 12 * 60 * 60 * 1000,
      encodeEmail = createJWT({
        data: { email: user_details.email },
        exp: defaultTimeToExpire
      });

    console.log('token: ', encodeEmail);

    if (user_details.status === UserStatus.PAYMENT_PENDING) {
      let data = await createLink('verifyAccount', encodeEmail);
      await verifyNewUser.send({
        to: user_details.email,
        use_alias: true,
        subject_params: {},
        content_params: {
          name: `${user_details.first_name} ${user_details.last_name}`,
          invitation_token: data.shortLink
        }
      });
    }
    return { payment };
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function chargeAmount(payment_details, transaction) {
  try {
    let { user_id, amount, currency, payment_type, token } = payment_details;

    let user_details = await User.findOne({ where: { id: user_id } }, transaction);
    if (!user_details) {
      throw new Error('Validation Error');
    }
    let { customer_id } = user_details,
      source_details = null;

    source_details = await client.customers.createSource(customer_id, { source: token });

    if (!source_details) {
      throw new Error('Unable to create Subscription');
    }

    let source_id = source_details.id;
    let subscription_details = await client.charges.create({
      amount: amount,
      currency: currency,
      source: source_id,
      description: 'Signle time payment'
    });

    if (!subscription_details) {
      throw new Error('Unable to create Subscription');
    }

    let { card_id } = subscription_details;
    let payment_params = {
      user_id: user_id,
      stripe_customer_id: customer_id,
      source_id: source_id,
      stripe_card_id: card_id,
      payment_type: payment_type,
      created_by: user_id,
      modified_by: user_id
    };
    let payment = await Payment.create(payment_params, transaction);

    return { payment };
  } catch (err) {
    throw new Error(err.message);
  }
}

// async function updateSource() {}

export async function getCardDetails(body) {
  try {
    let { customer_id, card_id } = body,
      card_details = null;
    card_details = await client.customers.retrieveSource(customer_id, card_id);

    return card_details;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getPaymentInformation(body, user) {
  try {
    let { user_id } = user,
      subscription_details = null;
    let paymentDetailsDb = Payment.findOne({
        where: {
          id: body.payment_id
        }
      }),
      userDetailsDb = User.findOne({
        where: {
          id: user_id,
          deleted: false
        },
        include: [...User.getStandardInclude()]
      });

    let [paymentDetails, userDetails] = await Promise.all([paymentDetailsDb, userDetailsDb]);
    if (userDetails && userDetails.org && userDetails.org.subscription_id) {
      logger.debug('subscription _id :: ', userDetails.org.subscription_id);
      let subscription = await client.subscriptions.retrieve(userDetails.org.subscription_id);
      subscription_details = {
        current_period_end: subscription.current_period_end,
        current_period_start: subscription.current_period_start,
        customer: subscription.customer
      };
    }
    return { paymentDetails, subscription_details };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function cancelSubscription(body) {
  try {
    let { subscription_id, actual_user_id } = body;
    let subscription_details = await client.subscriptions.update(subscription_id, {
      cancel_at_period_end: true
    });

    await User.update({
      subscription_plan: 1
    }, {
      where: {
        id: actual_user_id
      }
    })
    return subscription_details;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function renewSubscription(body) {
  try {
    let { subscription_id } = body;
    let subscription_details = await client.subscriptions.update(subscription_id, {
      cancel_at_period_end: false
    });

    return subscription_details;
  } catch (error) {
    throw new Error(error.message);
  }
}
