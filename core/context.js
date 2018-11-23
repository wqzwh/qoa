const Cookies = require('cookies');
const COOKIES = Symbol('context#cookies');

module.exports = {
  get url() {
    return this.request.url
  },

  get body() {
    return this.response.body
  },

  set body(val) {
    this.response.body = val
  },

  get cookies() {
    if (!this[COOKIES]) {
      this[COOKIES] = new Cookies(this.req, this.res, {
        keys: this.app.keys
      });
    }
    return this[COOKIES];
  },

  set cookies(_cookies) {
    this[COOKIES] = _cookies;
  }
}
