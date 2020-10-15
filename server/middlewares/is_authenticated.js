import { decodeJWT } from '../common/auth.utils';
import compose from 'composable-middleware';

/**
 * @apiDefine isAuthenticated
 *
 * @apiHeader {String} Authorization User bearer token
 *
 * @apiError (Error 401) AuthHeaderMissing Please make sure your request has an Authorization header!
 * @apiError (Error 401) TokenExpired Token has expired!
 * @apiError (Error 500) InvalidToken Invalid Token!
 */
export default function isAuthenticated() {
  return compose().use(async (req, res, next) => {
    const { authorization: bearerToken } = req.headers;

    if (!bearerToken) {
      return res.status(401).send({
        message: 'Please make sure your request has an Authorization header!'
      });
    }

    const [, authToken] = bearerToken.split(' ');
    let payload;
    try {
      payload = await decodeJWT({ token: authToken });
    } catch (e) {
      if (e.message === 'Token expired') {
        return res.status(401).send({ message: 'Token has expired!' });
      }
      return res.status(401).send({ message: 'Invalid Token!' });
    }

    if (!payload || !payload.user) {
      return res.status(401).send({ message: 'Invalid Token!' });
    }

    // uncomment this only if project requires user active check for every API call
    // const user = await User.findOne({ where: { id: payload.user.id, deleted: false } });
    //
    // if (!user || !user.is_verified || UserStatus.ACTIVE !== user.status) {
    //   return res.status(401).send({ message: 'Invalid user!' });
    // }

    // eslint-disable-next-line require-atomic-updates
    // req.user_id = payload.user.id;
    // req.actual_user_id = payload.user.actual_user_id;
    req.user = {
      user_id: payload.user.id,
      actual_user_id: payload.user.actual_user_id
    };
    // req.current_role_id = payload.user.current_role_id;

    return next();
  });
}
