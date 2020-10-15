// Easy way to add status code to error
// eslint-disable-next-line
Error.prototype.setHttpCode = function(c) {
  try {
    if (+c && !Number.isNaN(+c)) {
      this.statusCode = +c;
    }
  } catch (e) {
    //
  }
  return this;
};
