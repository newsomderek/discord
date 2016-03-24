
var statusCodes = {
    // The component is working
    operational: 0,

    // The component is experiencing some slowness
    performanceIssues: 1,

    // The component may not be working for everybody
    partialOutage: 2,

    // The component is not working for anybody.
    majorOutage: 3,

    // Some other issue or status
    other: 4
};

// list of uptime status checker methods
// each uptime checker method should return a valid status code
var componentChecks = [];

// list of component groupings
// a simple way to organize component checks
var conmponentGroups = [];

module.exports = {

    getStatusCodes: function() {
        return statusCodes;
    },

    getComponentChecks: function() {
        return componentChecks;
    },

    addComponent: function(componentLabel, groupId, method, componentId, performanceLimit) {

        if(!componentLabel || !groupId || !method) {
            return;
        }

        componentChecks.push({
            componentId: componentId || componentLabel,
            method: method,
            componentLabel: componentLabel,
            groupId: groupId,

            // default -1 means that there is no limit to trigger a performance issue status
            performanceLimit: performanceLimit || -1
        });

    },

    getComponentGroups: function() {
        return conmponentGroups;
    },

    resetGroups: function() {
        conmponentGroups = [];
    },

    addComponentGroup: function(groupId, groupLabel) {

        if(!groupId || !groupLabel) {
            return;
        }

        conmponentGroups.push({
            groupId: groupId,
            groupLabel: groupLabel
        });

    },

    resetComponents: function() {
        componentChecks = [];
    },

    getStatusReport: function(callback) {

        var total = componentChecks.length;
        var count = 0;

        var statusReport = [];

        componentChecks.map(function(check) {

            var start = Date.now();

            check.method(function(err, data) {

                // component check duration in seconds
                var duration = parseInt((Date.now() - start) / 1000);

                // check performance limit
                if(check.performanceLimit != -1) {

                    // operational status, but perforance limit has been met
                    if(duration >= check.performanceLimit && data.status == statusCodes.operational) {
                        data.status = statusCodes.performanceIssues;
                        data.message = 'Request took longer then ' + check.performanceLimit + ' second performance limit.';
                    }

                }

                statusReport.push({
                    componentId: check.componentId,
                    componentLabel: check.componentLabel,
                    groupId: check.groupId,
                    status: data.status,
                    message: data.message || null,
                    duration: duration
                });

                ++count;

                // only return callback after all component checks have been made
                if (count > (total - 1)) {
                    return callback({
                        groups: conmponentGroups,
                        status: statusReport
                    });
                }

            });

        });

    }

};
