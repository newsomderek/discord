
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
    }

};
