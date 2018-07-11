/*jslint
    es6
*/
"use strict";

const {describe, it} = require("mocha");

describe("authorize-show CLI", function () {
    const {assert} = require("chai");
    const {execFile} = require("child_process");
    const join = require('path').join;
    const script = join(process.cwd(), 'bin', 'authorize-show.js');

    describe("(without argument)", function () {
        it("should print usage on stderr", function (done) {
            execFile("node", [script], function (error, stdout, stderr) {
                assert.ifError(error);
                assert.isEmpty(stdout);
                assert.isNotEmpty(stderr);
                done();
            });
        });
    });

    describe("(without user nor project)", function () {
        it("should print usage on stderr", function (done) {
            execFile("node", [script, "--domain", "--token"], function (error, stdout, stderr) {
                assert.ifError(error);
                assert.isEmpty(stdout);
                assert.isNotEmpty(stderr);
                done();
            });
        });
    });

    describe("(without domain)", function () {
        it("should print usage on stderr", function (done) {
            execFile("node", [script, "--project", "--token", "--user"], function (error, stdout, stderr) {
                assert.ifError(error);
                assert.isEmpty(stdout);
                assert.isNotEmpty(stderr);
                done();
            });
        });
    });

    describe("(without token)", function () {
        it("should print usage on stderr", function (done) {
            execFile("node", [script, "--domain", "--project", "--user"], function (error, stdout, stderr) {
                assert.ifError(error);
                assert.isEmpty(stdout);
                assert.isNotEmpty(stderr);
                done();
            });
        });
    });

    describe("--help", function () {
        it("should print usage on stderr", function (done) {
            execFile("node", [script, "--help"], function (error, stdout, stderr) {
                assert.ifError(error);
                assert.isEmpty(stdout);
                assert.isNotEmpty(stderr);
                done();
            });
        });
    });

    describe("--version", function () {
        it("should print version on stdout", function (done) {
            execFile("node", [script, "--version"], function (error, stdout, stderr) {
                assert.ifError(error);
                assert.isNotEmpty(stdout);
                assert.isEmpty(stderr);
                done();
            });
        });
    });
});
