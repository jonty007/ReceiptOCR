const dot = require('dot'),
  path = require('path');

dot.log = false; // remove logs
const base_templates = dot.process({
  path: path.join(__dirname, 'email/templates')
});

class Template {
  constructor({ template, params } = {}) {
    this.template = template;
    this.params = params;
  }

  async getContent() {
    const compiled_html = base_templates[this.template](this.params);
    return compiled_html;
  }
}

module.exports = {
  Template
};
