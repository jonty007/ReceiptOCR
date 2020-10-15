const puppeteer = require('puppeteer');

class HtmlToPdf {
  constructor({ html_content, format } = {}) {
    this.html_content = html_content;
    this.format = format;
  }

  async generatePdf() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // We set the page content as the generated html by handlebars
    await page.setContent(this.html_content);
    // We use pdf function to generate the pdf in the same folder as this file.
    let pdfContent = await page.pdf({ format: this.format });
    await browser.close();
    return pdfContent;
  }
}

module.exports = {
  HtmlToPdf
};
