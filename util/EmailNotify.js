
var StatusChecker = require('./StatusChecker.js');

// load aws sdk
var aws = require('aws-sdk');

// load aws config
//aws.config.loadFromPath('config.json');
var EmailNotify = function() {};

EmailNotify.prototype.wordifyReport = function(statusReport) {
    return '';
};

EmailNotify.prototype.send = function(fromEmail, toEmails, subject, bodyText, bodyHtml, callback) {

    if(!fromEmail || !toEmails) {
        return callback(true, 'FROM and/or TO emails are missing!');
    }

    subject = subject || 'Discord - Uptime Tracker';

    aws.config.update({
        region: process.env.AWS_DEFAULT_REGION
    });

    var ses = new aws.SES({
        apiVersion: '2010-12-01'
    });

    ses.sendEmail({
        Source: fromEmail,
        Destination: {
            ToAddresses: toEmails
        },
        Message: {
            Subject: {
                Data: subject
            },
            Body: {
                Text: {
                    Data: bodyText
                },
                Html: {
                    Data: bodyHtml
                }
            }
        }
    },
    function(err, data) {
        return callback(err, data);
    });

};

module.exports = EmailNotify;
