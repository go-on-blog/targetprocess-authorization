/*jslint
    es6
*/
"use strict";

const {describe, it} = require("mocha");

describe("users", function () {
    const {expect} = require("chai");
    const factory = require("../../../lib/domain/users");
    const credentials = require("../../credentials");
    const config = Object.assign({resource: "Users"}, credentials);

    describe("getByName", function () {
        it("should provide a getByName() function", function () {
            const sut = factory(config);

            return expect(sut)
                .to.have.property("getByName")
                .and.to.be.a("function");
        });
    });

    describe("getActive", function () {
        it("should provide a getActive() function", function () {
            const sut = factory(config);

            return expect(sut)
                .to.have.property("getActive")
                .and.to.be.a("function");
        });
    });

    describe("filter", function () {
        it("should provide a filter() function", function () {
            const sut = factory(config);

            return expect(sut)
                .to.have.property("filter")
                .and.to.be.a("function");
        });
    });
});
