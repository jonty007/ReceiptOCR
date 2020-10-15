/**
 * @apiDefine hasSubroleAccess
 *
 * @apiError (Error 401) UserNotFound User is not authorized!
 * @apiError (Error 403) UserUnauthorized User is not authorized!
 *
 */
module.exports = function hasSubroleAccess(allowed_roles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).send({ message: 'User not found!' });
    }
    if (!allowed_roles.includes(req.user.subrole_id)) {
      return res.status(403).send({ message: 'User is not authorized!' });
    }
    return next();
  };
};
