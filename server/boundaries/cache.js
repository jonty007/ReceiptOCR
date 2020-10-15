const NodeCache = require('node-cache');
const appCache = new NodeCache(),
  cacheStore = function(consumer, data) {
    if (data != null && consumer != null) {
      appCache.set(consumer, data);
    }
  },
  cacheCheck = function(consumer) {
    if (consumer != null) {
      let value = appCache.get(consumer);
      return value;
    }
    return null;
  },
  cacheRemove = function(consumer) {
    if (consumer != null) {
      let value = appCache.take(consumer);
      return value;
    }
    return null;
  };

export { cacheStore, cacheCheck, cacheRemove };
