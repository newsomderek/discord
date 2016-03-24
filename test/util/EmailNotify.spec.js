var chai = require('chai');
var EmailNotify = require('./../../dist/util/EmailNotify.js')

var expect = chai.expect;
chai.should();

describe('Email Utility', function() {

    afterEach(function() {

    });

    describe('Email Notify', function() {

        it('should get list of status codes', function(done) {
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
            done();
        });

    });

});
