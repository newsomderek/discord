
/*
 * Components are units of work that test something and return a compliant
 *     status code, along with an optional message
 */

var StatusChecker = require('./StatusChecker.js');

module.exports = {

    checks: [
        {
            label: 'Some test here',
            group: 'Some Group Here',
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
