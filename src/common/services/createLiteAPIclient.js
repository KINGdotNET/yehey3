//import { Client } from 'welitejs';
var welitejs = require('welitejs');
var bluebird = require('bluebird');

function createLiteAPIclient() {
  
  
  var client = new welitejs.Client(process.env.WSS_API_URL);
  
  //const client = new Client(process.env.WSS_API_URL);
  // client.sendAsync = (message, params) =>
  //   new Promise((resolve, reject) => {
  //     client.call(message, params, (err, result) => {
  //       if (err !== null) return reject(err);
  //       return resolve(result);
  //     });
  //   });

  bluebird.promisifyAll(welitejs.Client.prototype);
  return client;
}

export default createLiteAPIclient;
