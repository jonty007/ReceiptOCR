const jwt = require('jwt-simple'),
  { jwtTokenSecret } = require('../config');

const createJWT = function({ data, exp, secret = jwtTokenSecret, hash_type = 'HS512' } = {}) {
    const now = Date.now(),
      defaultTimeToExpire = now + 14 * (24 * 60 * 60 * 1000),
      defaults = {
        iat: now
      };

    // set to -1 to skip expiry
    if (exp !== -1) {
      defaults.exp = exp || defaultTimeToExpire;
    }

    const payload = {
      ...defaults,
      ...data
    };

    return jwt.encode(payload, secret, hash_type);
  },
  decodeJWT = function({
    token,
    noVerify = false,
    secret = jwtTokenSecret,
    hash_type = 'HS512'
  } = {}) {
  
    const decoded = jwt.decode(token, secret, noVerify, hash_type);
    // if (decoded && decoded.exp && decoded.exp <= Date.now()) {
    //   throw new Error('Token expired');
    // }

    return decoded;
  },
  // convert version to equal digit numbers
  convertVersionToNumberArray = function convertVersionToNumberArray(arr, min_digits) {
    const new_array = [];
    arr.forEach(val => {
      let diff = min_digits - val.length,
        newVal;
      if (diff > 0) {
        let temp = '';
        while (diff) {
          temp += '0';
          --diff;
        }
        temp += val;
        newVal = temp;
      }
      new_array.push(newVal);
    });
    return new_array;
  };

module.exports = {
  createJWT,
  decodeJWT,
  convertVersionToNumberArray
};
