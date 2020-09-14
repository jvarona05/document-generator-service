'use strict';

const pdf = require('html-pdf');
const handlebars = require('handlebars');
const AWS = require('aws-sdk');

process.env.PATH = `${process.env.PATH}:/opt`
process.env.FONTCONFIG_PATH = '/opt'
process.env.LD_LIBRARY_PATH = '/opt'

const S3 = new AWS.S3();

module.exports.generateDocument = async event => {

  const { fileId, templateKey, data } = JSON.parse(event.body)

  try {
    let { Body }  = await S3.getObject({Bucket: process.env.TEMPLATE_BUCKET, Key: `pdf/${templateKey}.hbs`}).promise()

    // Body will be a buffer type so need to convert it to string before converting to pdf
    let html = Body.toString()

    html = handlebars.compile(html)(data)

    let file = await exportHtmlToPdf(html)
    
    const url = await S3.putObject({ Bucket: process.env.DOCUMENT_BUCKET, Key: `${fileId}.pdf`, Body: file }).promise()

    return {
      statusCode: 200,
      body: JSON.stringify({url})
    }
  }
  catch (err) {
    return {
      statusCode: err.statusCode || 400,
      body: err.message || JSON.stringify(err.message)
    }
  }
};

/**
 * 
 * @param {string} html 
 * takes html string as input and convert it into Buffer
 */
const exportHtmlToPdf = html => {
    return new Promise((resolve, reject) => {
        pdf.create(html, {
            format: "Letter",
            orientation: "portrait",
            // This is the path for compiled phantomjs executable stored in layer.
            // To test locally comment out the following line.
            phantomPath: '/opt/phantomjs_linux-x86_64'
        }).toBuffer((err, buffer) => {
            if (err) {
                reject(err)
            } else {
                resolve(buffer)
            }
        });
    })
}