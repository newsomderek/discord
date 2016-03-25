
/*
 * Components are units of work that test something and return a compliant
 *     status code, along with an optional message
 */

var StatusChecker = require('./StatusChecker.js');

module.exports = {

    groups: [
        {
            groupId: 'someGroupId',
            groupLabel: 'Some Component Group'
        }
    ],

    checks: [
        {
            componentId: 'some_api',
            componentLabel: 'Some test here',
            groupId: 'someGroupId',
            performanceLimit: 30, // requests taking more than 30 seconds, performance flag is tripped

            method: function(callback) {

                // DO API CHECK HERE

                var err = null;

                return callback(err, {
                    status: StatusChecker.getStatusCodes().operational,
                    message: null
                });

            }

        }
    ]

};
