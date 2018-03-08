#!/usr/bin/env node

var minimist = require("minimist"),
    withoutOption = "_",
    args;

args = minimist(process.argv.slice(2), {
    alias: {
        h: "help",
        p: "project",
        r: "role",
        u: "user",
        v: "version"
    }
});
args.path = args[withoutOption][0];

if (args.help || (process.argv.length <= 2 && process.stdin.isTTY)) {
    require("../lib/command/usage")(process.argv[1]).done(console.error);
} else if (args.version) {
    console.log("v" + require("../package.json").version);
} else {
    require("../lib/adapter/assign")(args).then(console.log, console.error);
}
