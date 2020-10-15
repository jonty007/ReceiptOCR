import { Router } from 'express';
import Busboy from 'busboy';
import { finished } from 'nodemailer/lib/xoauth2';

const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();

const ocr = Router();

ocr.post('/ocr/receipt', async (req, res, next) => {
  
  try {
    console.log(req.body);
    const busboy = new Busboy({ headers: req.headers });
    let base64data = [];
    let extractedText = {};
    busboy.on('file', async (fieldname, file, filename, encoding, mime_type) => {
      if (!mime_type || !filename) {
        return res.status(400).send({ message: 'VAL_FAILED' });
      }
      console.log('mime', mime_type);

      let buffer = '';
      file.setEncoding('base64');
      file.on('data', function(data) {
        buffer += data;
      }).on('end', function() {
        base64data.push(buffer);
      });

      extractedText = await client.textDetection("/Users/viveksingh/Documents/vivek/learning/1_ODTPi2VcGSRdWkPzwqBJLg.png");
      return res.send({
        data: extractedText
      });
    });

    busboy.on('field', (fieldname, value) => {
      console.log(fieldname, ' : ', value);
    });

    // busboy.on('finish', () => {
    //   console.log('finished');
    //   return res.send({
    //     data: extractedText
    //   });
    // });
    return req.pipe(busboy);
  } catch (e) {
    if (e.message) {
      return res.status(405).send({
        message: e.message
      });
    }
    return next(e);
  }
});

export default ocr;

