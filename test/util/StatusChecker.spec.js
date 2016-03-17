var chai = require('chai');
var StatusChecker = require('./../../dist/util/StatusChecker.js')

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

            StatusChecker.addComponent('label1', 'group1', function() {
                return {
                    status: statusCodes.operational,
                    message: 'message1'
                };
            });

            StatusChecker.addComponent('label2', 'group2', function() {
                return {
                    status: statusCodes.performanceIssues
                };
            });

            Object.keys(StatusChecker.getComponentChecks()[0]).should.have.length(3);

            StatusChecker.getComponentChecks()[0].label.should.equal('label1');
            StatusChecker.getComponentChecks()[0].group.should.equal('group1');

            StatusChecker.getComponentChecks()[0].method().status.should.equal(statusCodes.operational);
            StatusChecker.getComponentChecks()[0].method().message.should.equal('message1');

            Object.keys(StatusChecker.getComponentChecks()[1]).should.have.length(3);

            StatusChecker.getComponentChecks()[1].label.should.equal('label2');
            StatusChecker.getComponentChecks()[1].group.should.equal('group2');

            StatusChecker.getComponentChecks()[1].method().status.should.equal(statusCodes.performanceIssues);
            expect(StatusChecker.getComponentChecks()[1].method().message).to.be.undefined;

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

    });

});
