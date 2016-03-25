var chai = require('chai');

var expect = chai.expect;
chai.should();

var EmailNotify = require('./../../dist/util/EmailNotify.js');
var StatusChecker = require('./../../dist/util/StatusChecker.js');
var ComponentsExample = require('./../../dist/util/Components.example.js');


describe('Email Utility', function() {

    afterEach(function() {

    });

    describe('Email Notify', function() {

        it('should send a test email', function(done) {
            this.timeout(30000);

            var emailNotify = new EmailNotify();

            var fromEmail = process.env.DISCORD_NOTIFY_FROM_EMAIL;
            var toEmail = process.env.DISCORD_NOTIFY_TO_EMAILS.split(',');
            var subject = process.env.DISCORD_NOTIFY_SUBJECT;
            var bodyText = 'body text here';
            var bodyHtml = 'body html here';

            emailNotify.send(
                fromEmail, toEmail, subject, bodyText, bodyHtml,
                function(err, data) {
                    expect(err).to.be.null;
                    done();
                }
            );


        });

        it('should wordify a standard Discord report output', function(done) {
            // extend timeout in milliseconds
            this.timeout(4000);

            ComponentsExample.checks.map(function(check) {
                StatusChecker.addComponent(check.componentLabel, check.groupId, check.method, check.componentId, check.performanceLimit);
            });

            ComponentsExample.groups.map(function(group) {
                StatusChecker.addComponentGroup(group.groupId, group.groupLabel);
            });

            var emailNotify = new EmailNotify();

            StatusChecker.getStatusReport(function(statusReport) {

                var wordified = emailNotify.wordifyReport(statusReport);

                done();
            });


        });

    });

});
