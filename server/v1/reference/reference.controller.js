import { Router } from 'express';
import { DurationUnit, PaymentType, ReceiptCategory } from '../../db';
import { isAuthenticated } from '../../middlewares';

const reference = Router();

reference.get('/reference/:type', isAuthenticated(), async (req, res, next) => {
  try {
    let data = [];
    const { type } = req.params;

    switch (type) {
    case 'duration_unit':
      data = await DurationUnit.findAll({
          where: {
          deleted: false
          },
        order: [['sequence', 'ASC']]
        });
      break;
    case 'payment_type':
      data = await PaymentType.findAll({
          where: {
          deleted: false
        },
        order: [['sequence', 'ASC']]
        });
      break;
    case 'receipt_category':
      data = await ReceiptCategory.findAll({
          where: {
          deleted: false
          },
        order: [['sequence', 'ASC']]
        });
      break;
    default:
      break;
    }

    return res.send(data);
  } catch (e) {
    if (e.message) {
      return res.status(405).send({
        message: e.message
      });
    }
    return next(e);
  }
});

export default reference;
