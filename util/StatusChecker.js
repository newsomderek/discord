
var statusCodes = {
    operational: 0,       // The component is working
    performanceIssues: 1, // The component is experiencing some slowness
    partialOutage: 2,     // The component may not be working for everybody
    majorOutage: 3,        // The component is not working for anybody.
    other: 4              // Some other issue or status
};

// list of uptime status checker methods
// each uptime checker method should return a valid status code
var componentChecks = [];

module.exports = {

    getStatusCodes: function() {
        return statusCodes;
    },

    getComponentChecks: function() {
        return componentChecks;
    },

    addComponent: function(label, group, method) {

        if(!label || !group || !method) {
            return;
        }

        componentChecks.push({
            method: method,
            label: label,
            group: group
        });

    },

    resetComponents: function() {
        componentChecks = [];
    },

    getStatusReport: function(callback) {

        var total = componentChecks.length;
        var count = 0;

        var statusReportByGroup = {};

        componentChecks.map(function(check) {

            check.method(function(err, data) {

                if(!(check.group in statusReportByGroup)) {
                    statusReportByGroup[check.group] = [];
                }

                statusReportByGroup[check.group].push({
                    label: check.label,
                    status: data.status,
                    message: data.message || null
                });

                ++count;

                if (count > (total - 1)) {
                    return callback(statusReportByGroup);
                }

            });

        });

        return statusReportByGroup;

    }

};
