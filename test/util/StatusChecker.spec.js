var chai = require('chai');
var StatusChecker = require('./../../dist/util/StatusChecker.js')
var Components = require('./../../dist/util/Components.js');

var expect = chai.expect;
chai.should();

describe('Uptime Utility', function() {

    afterEach(function() {
        StatusChecker.resetComponents();
    });

    describe('Status Checking', function() {

        it('should get list of status codes', function(done) {

            var statusCodes = StatusChecker.getStatusCodes();

            Object.keys(statusCodes).should.have.length(5);

            statusCodes.operational.should.equal(0);
            statusCodes.performanceIssues.should.equal(1);
            statusCodes.partialOutage.should.equal(2);
            statusCodes.majorOutage.should.equal(3);
            statusCodes.other.should.equal(4);

            done();

        });

        it('should start with no component checks', function(done) {
            StatusChecker.getComponentChecks().length.should.equal(0);
            done();
        });

        it('should add component check when valid parameters are given', function(done) {
            StatusChecker.addComponent();
            StatusChecker.getComponentChecks().length.should.equal(0);

            StatusChecker.addComponent('label');
            StatusChecker.getComponentChecks().length.should.equal(0);

            StatusChecker.addComponent('label', 'group');
            StatusChecker.getComponentChecks().length.should.equal(0);

            StatusChecker.addComponent('label', 'group', function() {});
            StatusChecker.getComponentChecks().length.should.equal(1);

            StatusChecker.addComponent('label', 'group', function() {});
            StatusChecker.getComponentChecks().length.should.equal(2);

            done();
        });

        it('should return properly formatted component check methods', function(done) {

            var statusCodes = StatusChecker.getStatusCodes();

            StatusChecker.addComponent('label1', 'group1', function(callback) {
                return callback(false, {
                    status: statusCodes.operational,
                    message: 'message1'
                });
            });

            StatusChecker.addComponent('label2', 'group2', function(callback) {
                return callback(null, {
                    status: statusCodes.performanceIssues
                });
            });

            Object.keys(StatusChecker.getComponentChecks()[0]).should.have.length(3);

            StatusChecker.getComponentChecks()[0].label.should.equal('label1');
            StatusChecker.getComponentChecks()[0].group.should.equal('group1');

            StatusChecker.getComponentChecks()[0].method(function(err, data) {
                err.should.equal(false);
                data.status.should.equal(statusCodes.operational);
                data.message.should.equal('message1');
            });

            Object.keys(StatusChecker.getComponentChecks()[1]).should.have.length(3);

            StatusChecker.getComponentChecks()[1].label.should.equal('label2');
            StatusChecker.getComponentChecks()[1].group.should.equal('group2');

            StatusChecker.getComponentChecks()[1].method(function(err, data) {
                expect(err).to.be.null;
                data.status.should.equal(statusCodes.performanceIssues);
                expect(data.message).to.be.undefined;
            });

            done();
        });

        it('should clear out all components from list', function(done) {
            StatusChecker.addComponent('label1', 'group1', function() {});
            StatusChecker.addComponent('label2', 'group1', function() {});
            StatusChecker.addComponent('label3', 'group1', function() {});

            StatusChecker.getComponentChecks().length.should.equal(3);

            StatusChecker.resetComponents();

            StatusChecker.getComponentChecks().length.should.equal(0);

            done();
        });

        it('should get a components status report', function(done) {
            this.timeout(4000);

            Components.checks.map(function(check) {
                StatusChecker.addComponent(check.label, check.group, check.method);
            });

            StatusChecker.getStatusReport(function(statusReport) {
                statusReport['Some Group Here'][0].status.should.equal(StatusChecker.getStatusCodes().operational);
                statusReport['Some Group Here'][0].label.should.equal('Some test here');
                expect(statusReport['Some Group Here'][0].message).to.be.null;
                done();
            });

        });

    });

});
