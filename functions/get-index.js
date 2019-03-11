'use strict';

const fs = require('fs');
const {promisify} = require('util');
const readFile = promisify(fs.readFile);
const Mustache = require('mustache');
const axios = require('axios');
const aws4 = require('aws4');
const URL = require('url');
// const bluebird = require('bluebird');
// const awscred = bluebird.promisifyAll(require('awscred'));

const awsRegion = process.env.AWS_REGION;
const restaurantsApiRoot = process.env.restaurants_api;
const cognitoUserPoolId = process.env.cognito_user_pool_id;
const cognitoClientId = process.env.cognito_client_id;
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

let htmlCache;

async function loadHtml() {
  if (!htmlCache) {
    htmlCache = await readFile('static/index.html', 'utf-8');
  }

  return htmlCache;
}

async function loadRestaurants() {
  let url = URL.parse(restaurantsApiRoot);
  let opts = {
    host: url.hostname,
    path: url.pathname
  };

  // if (!process.env.AWS_ACCESS_KEY_ID) {
  //   let cred = (await awscred.loadAsync()).credentials;
  //
  //   process.env.AWS_ACCESS_KEY_ID = cred.accessKeyId;
  //   process.env.AWS_SECRET_ACCESS_KEY = cred.secretAccessKey;
  // }

  aws4.sign(opts);

  let headers = {
    Host:          opts.headers.Host,
    'X-Amz-Date':  opts.headers['X-Amz-Date'],
    Authorization: opts.headers.Authorization,
  };

  if (opts.headers['X-Amz-Security-Token']) {
    headers['X-Amz-Security-Token'] = opts.headers['X-Amz-Security-Token'];
  }

  let res = await axios.get(
    restaurantsApiRoot,
    {
      headers
    }
  );

  return res.data;
}

module.exports.handler = async (event, context, callback) => {
  const template = await loadHtml();
  const restaurants = await loadRestaurants();
  const dayOfWeek = days[new Date().getDay()];
  const view = {
    dayOfWeek,
    restaurants,
    awsRegion,
    cognitoUserPoolId,
    cognitoClientId,
    searchUrl: `${restaurantsApiRoot}/search`
  };
  const html = Mustache.render(template, view);

  const response = {
    statusCode: 200,
    body:       html,
    headers:    {
      'content-type': 'text/html; charset=UTF-8'
    }
  };

  callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
