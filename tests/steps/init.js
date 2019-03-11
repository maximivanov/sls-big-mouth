'use strict';

const bluebird = require('bluebird');

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

  console.log('AWS Credentials loaded');

  initialized = true;
};

module.exports.init = init;