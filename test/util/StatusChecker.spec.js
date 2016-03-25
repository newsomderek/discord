var chai = require('chai');
var StatusChecker = require('./../../dist/util/StatusChecker.js');
var ComponentsExample = require('./../../dist/util/Components.example.js');
var Components;

try {
    var Components = require('./../../dist/util/Components.js');
} catch (ex) {

}

var expect = chai.expect;
chai.should();

describe('Uptime Utility', function() {

    afterEach(function() {
        StatusChecker.resetComponents();
        StatusChecker.resetGroups();
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

            StatusChecker.addComponent('label', 'group', function() {}, 'labelId');
            StatusChecker.getComponentChecks().length.should.equal(3);

            StatusChecker.addComponent('label', 'group', function() {}, 'labelId', 90);
            StatusChecker.getComponentChecks().length.should.equal(4);

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

            Object.keys(StatusChecker.getComponentChecks()[0]).should.have.length(5);

            StatusChecker.getComponentChecks()[0].componentLabel.should.equal('label1');
            StatusChecker.getComponentChecks()[0].componentId.should.equal('label1');
            StatusChecker.getComponentChecks()[0].groupId.should.equal('group1');

            StatusChecker.getComponentChecks()[0].method(function(err, data) {
                err.should.equal(false);
                data.status.should.equal(statusCodes.operational);
                data.message.should.equal('message1');
            });

            Object.keys(StatusChecker.getComponentChecks()[1]).should.have.length(5);

            StatusChecker.getComponentChecks()[1].componentLabel.should.equal('label2');
            StatusChecker.getComponentChecks()[1].componentId.should.equal('label2');
            StatusChecker.getComponentChecks()[1].groupId.should.equal('group2');

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

        it('should clear out all component groups from list', function(done) {
            StatusChecker.addComponentGroup('groupId1', 'groupLabel1');
            StatusChecker.addComponentGroup('groupId2', 'groupLabel2');
            StatusChecker.addComponentGroup('groupId3', 'groupLabel3');

            StatusChecker.getComponentGroups().length.should.equal(3);

            StatusChecker.resetGroups();

            StatusChecker.getComponentGroups().length.should.equal(0);

            done();
        });

        it('should start with no component groups', function(done) {
            StatusChecker.getComponentGroups().length.should.equal(0);
            done();
        });

        it('should add component group when valid parameters are given', function(done) {
            StatusChecker.addComponentGroup();
            StatusChecker.getComponentGroups().length.should.equal(0);

            StatusChecker.addComponentGroup('groupId');
            StatusChecker.getComponentGroups().length.should.equal(0);

            StatusChecker.addComponentGroup('groupId', 'labelId');
            StatusChecker.getComponentGroups().length.should.equal(1);

            StatusChecker.addComponentGroup('groupId2', 'labelId2');
            StatusChecker.getComponentGroups().length.should.equal(2);

            done();
        });

        it('should return properly formatted component groups', function(done) {

            var statusCodes = StatusChecker.getStatusCodes();

            StatusChecker.addComponentGroup('groupId1', 'groupLabel1');
            StatusChecker.addComponentGroup('groupId2', 'groupLabel2');

            Object.keys(StatusChecker.getComponentGroups()[0]).should.have.length(2);

            StatusChecker.getComponentGroups()[0].groupId.should.equal('groupId1');
            StatusChecker.getComponentGroups()[0].groupLabel.should.equal('groupLabel1');

            Object.keys(StatusChecker.getComponentGroups()[1]).should.have.length(2);

            StatusChecker.getComponentGroups()[1].groupId.should.equal('groupId2');
            StatusChecker.getComponentGroups()[1].groupLabel.should.equal('groupLabel2');

            done();
        });

        it('should get an example components status report', function(done) {
            // extend timeout in milliseconds
            this.timeout(4000);

            ComponentsExample.checks.map(function(check) {
                StatusChecker.addComponent(check.componentLabel, check.groupId, check.method, check.componentId, check.performanceLimit);
            });

            ComponentsExample.groups.map(function(group) {
                StatusChecker.addComponentGroup(group.groupId, group.groupLabel);
            });

            StatusChecker.getStatusReport(function(statusReport) {
                statusReport.status[0].status.should.equal(StatusChecker.getStatusCodes().operational);
                statusReport.status[0].componentId.should.equal('some_api');
                expect(statusReport.status[0].message).to.be.null;

                statusReport.groups.length.should.equal(1);
                statusReport.groups[0].groupId.should.equal('someGroupId');
                statusReport.groups[0].groupLabel.should.equal('Some Component Group');

                done();
            });

        });

        it('should be a stub for future components test launching', function(done) {

            // first confirm a Components modules was detected and loaded
            if(Components) {

                // extend timeout in milliseconds
                this.timeout(120000);

                Components.checks.map(function(check) {
                    StatusChecker.addComponent(check.componentLabel, check.groupId, check.method, check.componentId, check.performanceLimit);
                });

                Components.groups.map(function(group) {
                    StatusChecker.addComponentGroup(group.groupId, group.groupLabel);
                });

                StatusChecker.getStatusReport(function(statusReport) {
                    done();
                });

            } else {
                done();
            }

        });

    });

});
