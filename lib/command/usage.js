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
        const lift = require("when/node").lift;
        const readFile = lift(require("fs").readFile);
        const path = require("path");
        const parts = path.parse(command);

        return readFile(path.join(parts.dir, `${parts.name}-usage.txt`))
            .then((b) => b.toString());
    }

    module.exports = usage;
}());
