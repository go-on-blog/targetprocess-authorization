#!/usr/bin/env node

var minimist = require("minimist"),
    args;

args = minimist(process.argv.slice(2), {
    alias: {
        d: "domain",
        h: "help",
        p: "project",
        r: "role",
        t: "token",
        u: "user",
        v: "version"
    }
});

function format(data) {
    return data.reduce(function (accumulator, item) {
        return accumulator.concat(`- ${item.User.FirstName} ${item.User.LastName} is assigned to ${item.Project.Name} with the ${item.Role.Name} role\n`);
    }, "");
}

function log(result) {
    if (result && result.Items) {
        console.log(`Newly assigned items:\n${format(result.Items)}`);
    }
}

if (args.version) {
    console.log("v" + require("../package.json").version);
} else if (args.help || process.argv.length < 6 || !args.domain || !args.token || (!args.user && !args.project)) {
    require("../lib/command/usage")(process.argv[1]).then(console.error);
} else {
    require("../lib/adapter/authorize-assign")(args).then(log, console.error);
}
