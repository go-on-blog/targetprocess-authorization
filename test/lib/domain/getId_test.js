/*jslint
    es6
*/
"use strict";

const {describe, it} = require("mocha");

describe("getId", function () {
    const chai = require("chai");
    const expect = chai.expect;
    const chaiAsPromised = require("chai-as-promised");
    const sinon = require("sinon");
    const factory = require("../../../lib/domain/getId");
    const credentials = require("../../credentials");
    const config = Object.assign({resource: "UserStories"}, credentials);

    chai.use(chaiAsPromised);

    describe("getId", function () {
        function getSUT(args, value) {
            const request = sinon.stub();
            const retrieve = require("targetprocess-api/retrieve")(Object.assign({request}, config));
            const stampit = require("@stamp/it");
            const stamp = stampit(factory, {props: {retrieve}});

            request.rejects();
            request.withArgs(args).resolves(value);

            return stamp();
        }

        it("should return a fulfilled promise when the name includes a single quote", function () {
            const hasQuote = "x'y";
            const args = {
                method: "GET",
                uri: `https://${credentials.domain}/api/v1/UserStories/`,
                qs: {
                    token: credentials.token,
                    where: "Name eq 'x\\'y'"
                },
                json: true
            };
            const sut = getSUT(args, {Items: [{Id: 42}]});

            return expect(sut.getId(hasQuote)).to.be.fulfilled;
        });

        it("should return null when no item of that name is found", function () {
            // Not finding the expected resource should not be considered as an
            // exceptional situation. For instance, a user may have deleted the
            // resource on purpose. So we don't reject the promise but return
            // a failure value (null).
            // See https://github.com/domenic/promises-unwrapping/blob/master/docs/writing-specifications-with-promises.md#rejections-should-be-used-for-exceptional-situations
            const noItem = "x";
            const args = {
                method: "GET",
                uri: `https://${credentials.domain}/api/v1/UserStories/`,
                qs: {
                    token: credentials.token,
                    where: `Name eq '${noItem}'`
                },
                json: true
            };
            const sut = getSUT(args, {Items: []});

            return expect(sut.getId(noItem))
                .to.eventually.be.null;
        });

        it("should return a number when one single item of that name is found", function () {
            const singleItem = "x";
            const args = {
                method: "GET",
                uri: `https://${credentials.domain}/api/v1/UserStories/`,
                qs: {
                    token: credentials.token,
                    where: `Name eq '${singleItem}'`
                },
                json: true
            };
            const sut = getSUT(args, {Items: [{Id: 42}]});

            return expect(sut.getId(singleItem))
                .to.eventually.be.a("number")
                .and.to.equal(42);
        });

        it("should return an array of numbers when multiple items of that name are found", function () {
            const multipleItems = "x";
            const args = {
                method: "GET",
                uri: `https://${credentials.domain}/api/v1/UserStories/`,
                qs: {
                    token: credentials.token,
                    where: `Name eq '${multipleItems}'`
                },
                json: true
            };
            const sut = getSUT(args, {Items: [{Id: 2}, {Id: 3}]});

            return expect(sut.getId(multipleItems))
                .to.eventually.be.an("array")
                .and.to.have.lengthOf(2)
                .and.to.have.members([2, 3]);
        });
    });
});
