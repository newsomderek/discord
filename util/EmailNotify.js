
var format = require('string-format');

var StatusChecker = require('./StatusChecker.js');

// load aws sdk
var aws = require('aws-sdk');

// load aws config
//aws.config.loadFromPath('config.json');
var EmailNotify = function() {};

EmailNotify.prototype.wordifyReport = function(statusReport) {
    var statusesByGroupId = {};
    var textWordified = '';
    var htmlWordified = '';

    statusReport.status.map(function(status) {
        if(!(status.groupId in statusesByGroupId)) {
            statusesByGroupId[ status.groupId ] = [];
        }

        statusesByGroupId[ status.groupId ].push(status);
    });

    statusReport.groups.map(function(group) {
        htmlWordified += format('<b>{0}</b><br /><br />', group.groupLabel.toUpperCase());
        textWordified += format('{0}\n\n', group.groupLabel.toUpperCase());

        statusesByGroupId[ group.groupId ].map(function(status) {
            htmlWordified += format('<div style="padding-left: 25px"><b>{0}</b>: {1}<div><br />', status.componentLabel, StatusChecker.getStatusCodeLabel(status.status));
            textWordified += format('\t{0}: {1}\n', status.componentLabel, StatusChecker.getStatusCodeLabel(status.status));

            if(status.message) {
                htmlWordified += format('<div style="padding-left: 25px">{0}<div><br /><br />', status.message);
                textWordified += format('\t{0}\n\n', status.componentLabel, status.message);
            } else {
                htmlWordified += '<br />';
                textWordified += '\n';
            }
        });
    });

    return {
        text: textWordified,
        html: htmlWordified
    };
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
