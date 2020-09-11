'use strict';

const fetch = require('node-fetch');
const AWS = require('aws-sdk');

const S3 = new AWS.S3();

module.exports.hello = async event => {

  const { filePath, vars } = JSON.parse(event.body)

  try {
    const data = await S3.getObject({Bucket: process.env.BUCKET, Key: filePath}).promise();
    
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    }
  }
  catch (err) {
    return {
      statusCode: err.statusCode || 400,
      body: err.message || JSON.stringify(err.message)
    }
  }
};
