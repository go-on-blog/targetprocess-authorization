/*jslint
    es6, this
*/
"use strict";

const {after, before, describe, it} = require("mocha");

describe("users", function () {
    const chai = require("chai");
    const expect = chai.expect;
    const chaiAsPromised = require("chai-as-promised");
    const users = require("../../../lib/domain/users");
    const credentials = require("../../credentials");
    const userName = Math.random().toString(36).replace(/[^a-z]+/g, "");
    var userId;

    chai.use(chaiAsPromised);

    this.timeout(5000);

    before(function () {
        const tp = require("targetprocess-api")(credentials);
        const obj = {
            "FirstName": "Abraham",
            "LastName": userName,
            "Email": `${userName}@go-on.blog`,
            "Login": "abcd",
            "Password": "efgh"
        };

        return tp.create("Users", obj).then(function (item) {
            userId = item.Id;
            return item;
        });
    });

    describe("getId", function () {
        it("should return a number represented the id of the user created", function () {
            const sut = users(credentials);

            return expect(sut.getId(userName))
                .to.eventually.be.a("number")
                .and.to.equal(userId);
        });
    });

    after(function () {
        const tp = require("targetprocess-api")(credentials);
        return tp.remove("Users", userId);
    });
});
