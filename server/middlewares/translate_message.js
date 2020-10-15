export default function(app) {
  app.use((req, res, next) => {
    const { send } = res;
    res.send = function(data) {
      if (data && data.message) {
        if (typeof data.message !== 'string' && data.message.code.indexOf('%s') >= 0) {
          data.message = res.translateN(data.message.code, data.message.replace);
        } else {
          data.message = res.translate(data.message);
        }
        let codeStr = res.statusCode;
        if (res.statusCode !== 200) {
          codeStr = res.statusCode ? `errorCodes.${res.statusCode}` : 'errorCodes.default';
        }
        data.status_code = res.translate(codeStr);
      }
      send.apply(res, arguments);
    };
    next();
  });
}
