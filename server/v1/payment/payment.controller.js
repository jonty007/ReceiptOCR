import { Router } from 'express';
import { isAuthenticated } from '../../middlewares';
import { SubscriptionPlan, sequelize } from '../../db';
import {
  cancelSubscription,
  createPayment,
  getCardDetails,
  getPaymentInformation,
  renewSubscription,
  chargeAmount
} from './payment.service';

const payment = Router();

payment.get('/payment/plans', async (req, res, next) => {
  try {
    let plans = await SubscriptionPlan.findAndCountAll({
      where: {
        deleted: false
      }
    });

    return res.send(plans);
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
 * @api {post} /payment  Creates a new payment
 * @apiName CreatePayment
 * @apiGroup Payment
 * @apiHeader {String} authorization Users unique access-key.
 *
 */
payment.post('/payment', async (req, res, next) => {
  try {
    const { token, subscription_plan_id, payment_type, user_id, card } = req.body;
    let org = null;
    await sequelize.transaction(async transaction => {
      org = await createPayment(
        { token: token, subscription_plan_id, payment_type, user_id, card },
        transaction
      );
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

/*
 * @api {get} /payment/charge Charge specific amount
 * @apiName chargeAmount
 */
payment.post('/payment/charge', async (req, res, next) => {
  try {
    const { token, subscription_plan_id, payment_type, user_id, card, amount, currency } = req.body;
    let org = null;
    if (!amount) {
      return res.status(405).send({
        message: 'VAL_FAILED'
      });
    }
    if (!currency) {
      return res.status(405).send({
        message: 'VAL_FAILED'
      });
    }

    await sequelize.transaction(async transaction => {
      org = await chargeAmount(
        { token: token, subscription_plan_id, payment_type, user_id, card, amount, currency },
        transaction
      );
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

/*
 * @api {get} /payment/card-details Get cards details by card id
 * @apiName GetCardDetails
 * @apiGroup Payment
 * @apiHeader {String} authorization Users unique access-key.
 *
 */
payment.get('/payment/card-details', isAuthenticated(), async (req, res, next) => {
  try {
    const { card_id, customer_id } = req.body;

    let org = await getCardDetails({ card_id, customer_id });

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
 * @api {post} /payment/cancel Cancel a subscription
 * @apiName CancelSubscription
 * @apiGroup Payment
 * @apiHeader {String} authorization Users unique access-key.
 *
 */
payment.post('/payment/cancel', isAuthenticated(), async (req, res, next) => {
  try {
    const { subscription_id } = req.body;
    const {actual_user_id} = req.user;
    let org = await cancelSubscription({ subscription_id, actual_user_id });
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
 * @api {get} /payment/:id  Find payment details by payment id
 * @apiName FindPayment
 * @apiGroup Payment
 * @apiHeader {String} authorization Users unique access-key.
 *
 */
payment.get('/payment/:payment_id', isAuthenticated(), async (req, res, next) => {
  try {
    const { card_id } = req.body,
      { payment_id } = req.params;

    if (!payment_id || !card_id) {
      return res.status(405).send({
        message: 'VAL_FAILED'
      });
    }

    let org = await getPaymentInformation(
      { card_id, payment_id },
      { user_id: req.user.actual_user_id }
    );

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
 * @api {post} /payment/renew Renew a subscription
 * @apiName RenewSubscription
 * @apiGroup Payment
 * @apiHeader {String} authorization Users unique access-key.
 *
 */
payment.post('/payment/renew/:id', isAuthenticated(), async (req, res, next) => {
  try {
    const { card_id } = req.body;

    let org = await renewSubscription({ card_id });

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
 * @api {post} /payment/update-source Update subscription source a subscription
 * @apiName RenewSubscription
 * @apiGroup Payment
 * @apiHeader {String} authorization Users unique access-key.
 *
 */
payment.post('/payment/update-source/:id', isAuthenticated(), async (req, res, next) => {
  try {
    const { card_id } = req.body;

    let org = await cancelSubscription({ card_id });

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

export default payment;
