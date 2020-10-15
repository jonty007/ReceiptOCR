import { Router } from 'express';
import { SubscriptionPlan } from '../../db';

const subscription_plans = Router();

/**
 * @api {get} /subscription-plans  Find all subscription plans
 * @apiName Get All Subscription Plans
 * @apiGroup Subscription Plans
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   "count": 1,
 *   "rows": [{
 *     "id": 1,
 *     "plan_type": "MONTHLY",
 *     "plan_name": "Xyz",
 *     "duration": 30,
 *     "duration_unit": "days",
 *     "amount": 0,
 *     "sequence": 1
 *   }]
 * }
 *
 */
subscription_plans.get('/subscription-plans', async (req, res, next) => {
  try {
    let plans = await SubscriptionPlan.findAndCountAll({
      where: {
        deleted: false
      },
      attributes: [
        'id',
        'plan_type',
        'plan_name',
        'duration',
        'duration_unit',
        'amount',
        'sequence'
      ]
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

export default subscription_plans;
