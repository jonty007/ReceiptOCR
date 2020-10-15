/**
 * @apiDefine hasRoleAccess
 *
 * @apiError (Error 401) UserNotFound User is not authorized!
 * @apiError (Error 403) UserUnauthorized User is not authorized!
 *
 */
module.exports = function hasRoleAccess(allowed_roles = []) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).send({ message: 'User not found!' });
    }

    const subrole = await req.user.getSubrole();
    if (!allowed_roles.includes(subrole.role_id)) {
      return res.status(403).send({ message: 'User is not authorized!' });
    }
    return next();
  };
};
