#!/usr/bin/env node

var minimist = require("minimist"),
    args;

args = minimist(process.argv.slice(2), {
    alias: {
        d: "domain",
        h: "help",
        p: "project",
        t: "token",
        u: "user",
        v: "version"
    }
});

function logger(result) {
    function list(items) {
        items.forEach(function (item) {
            console.log(`- Id: ${item.Id}`);
        });
    }

    if (result.Deleted && result.Deleted.Items && result.Deleted.Items.length > 0) {
        console.log("Deleted items:");
        list(result.Deleted.Items);
    }

    if (result.NotDeleted && result.NotDeleted.Items && result.NotDeleted.Items.length > 0) {
        console.log("Items that were not deleted:");
        list(result.NotDeleted.Items);
    }
}

if (args.version) {
    console.log("v" + require("../package.json").version);
} else if (args.help || process.argv.length < 5 || !args.domain || !args.token || (!args.user && !args.project)) {
    require("../lib/command/usage")(process.argv[1]).then(console.error);
} else {
    require("../lib/adapter/authorize-unassign")(args).then(logger, console.error);
}
