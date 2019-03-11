'use strict';

const bluebird = require('bluebird');
const awscred = bluebird.promisifyAll(require('awscred'));

let initialized = false;

let init = async () => {
  if (initialized) {
    return;
  }

  process.env.AWS_REGION = 'us-east-1';
  process.env.restaurants_api = "https://7l64547jqa.execute-api.us-east-1.amazonaws.com/dev/restaurants";
  process.env.restaurants_table = "restaurants";
  process.env.cognito_user_pool_id = 'test_cognito_user_pool_id';
  process.env.cognito_client_id = 'test_cognito_client_id';

  if (!process.env.AWS_ACCESS_KEY_ID) {
    let cred = (await awscred.loadAsync()).credentials;

    process.env.AWS_ACCESS_KEY_ID = cred.accessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = cred.secretAccessKey;
  }

  console.log('AWS Credentials loaded');

  initialized = true;
};

module.exports.init = init;