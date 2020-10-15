const _ = require('lodash');

const timeout = time_ms => new Promise(resolve => setTimeout(resolve, time_ms)),
  getArrayDifference = (keys = [], keys_to_remove = []) => _.difference(keys, keys_to_remove);

function checkIfArrayHasAMatch(array_to_be_matched, array_match_pool) {
  return array_to_be_matched.some(role => array_match_pool.indexOf(role) !== -1);
}

const getUTCNow = () => {
  const now = new Date(),
    time = now.getTime();
  let offset = now.getTimezoneOffset();
  offset *= 60000;
  return time - offset;
};

function getCurrentTimeForCron() {
  const IsoString = new Date().toISOString(),
    [withoutms] = IsoString.split('.'),
    [date, time] = withoutms.split('T'),
    [hr, min] = time.split(':');

  return `${date} ${hr}:${min}`;
}

function getCapitalizedWord(word) {
  if (word) {
    return `${word[0].toUpperCase()}${word.substring(1)}`;
  }
  return null;
}

module.exports = {
  timeout,
  getUTCNow,
  getCurrentTimeForCron,
  getArrayDifference,
  checkIfArrayHasAMatch,
  getCapitalizedWord
};
