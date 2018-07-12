/*jslint
    es6
*/
(function () {
    "use strict";

    /**
     * Get usage of the given command
     *
     * @param {string} command - Command as returned by argv[1]
     * @return {string} Usage
     */
    function usage(command) {
        const {readFile} = require("fs");
        const path = require("path");
        const parts = path.parse(command);

        return new Promise(function (resolve, reject) {
            readFile(path.join(parts.dir, `${parts.name}-usage.txt`), function (error, result) {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.toString());
                }
            });
        });
    }

    module.exports = usage;
}());
