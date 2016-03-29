
/**
 * Uptime tracker
 */
var dotenv = require('dotenv');
dotenv.load();

var StatusChecker = require('./StatusChecker.js');
var EmailNotify = require('./EmailNotify.js');
var Components;

try {
    Components = require('./Components.js');
} catch (ex) {

}

exports.handler = function(event, context) {

    if(Components) {

        Components.checks.map(function(check) {
            StatusChecker.addComponent(check.componentLabel, check.groupId, check.method, check.componentId, check.performanceLimit);
        });

        Components.groups.map(function(group) {
            StatusChecker.addComponentGroup(group.groupId, group.groupLabel);
        });

        StatusChecker.getStatusReport(function(statusReport) {

            var allChecksOperational = true;

            // confirm all component status checks are operational
            statusReport.status.map(function(check) {
                if(check.status !== StatusChecker.getStatusCodes().other) {
                    allChecksOperational = false;
                }
            });

            if(!allChecksOperational) {
                var notify = new EmailNotify();
                var wordified = notify.wordifyReport(statusReport);

                var fromEmail = process.env.DISCORD_NOTIFY_FROM_EMAIL;
                var toEmail = process.env.DISCORD_NOTIFY_TO_EMAILS.split(',');
                var subject = process.env.DISCORD_NOTIFY_SUBJECT;
                var bodyText = wordified.text;
                var bodyHtml = wordified.html;

                notify.send(
                    fromEmail, toEmail, subject, bodyText, bodyHtml,
                    function(err, data) {
                        context.succeed();
                    }
                );
            } else {
                context.succeed();
            }

        });

    } else {
        context.succeed();
    }

};
