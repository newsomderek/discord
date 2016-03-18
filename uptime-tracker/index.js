
/**
 * Uptime tracker
 */
var dotenv = require('dotenv');
dotenv.load();


exports.handler = function(event, context) {
    console.log('lambda method handler');
    context.succeed();
};
