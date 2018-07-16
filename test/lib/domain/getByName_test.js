/*jslint
    es6
*/
"use strict";

const {describe, it} = require("mocha");

describe("getByName", function () {
    const chai = require("chai");
    const expect = chai.expect;
    const chaiAsPromised = require("chai-as-promised");
    const sinon = require("sinon");
    const factory = require("../../../lib/domain/getByName");
    const credentials = require("../../credentials");
    const config = Object.assign({resource: "UserStories"}, credentials);

    chai.use(chaiAsPromised);

    describe("getByName", function () {
        function getSUT(args, value) {
            const request = sinon.stub();
            const retriever = require("targetprocess-api/retrieve")(Object.assign({request}, config));
            const stampit = require("@stamp/it");
            const stamp = stampit(factory, {props: {retriever}});

            request.rejects();
            request.withArgs(args).resolves(value);

            return stamp();
        }

        it("should eventually return a fulfilled promise when the name includes a single quote", function () {
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

            return expect(sut.getByName(hasQuote)).to.be.fulfilled;
        });

        it("should eventually return null when no item of that name is found", function () {
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

            return expect(sut.getByName(noItem))
                .to.eventually.be.null;
        });

        it("should eventually return a number when one single item of that name is found", function () {
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

            return expect(sut.getByName(singleItem))
                .to.eventually.be.a("number")
                .and.to.equal(42);
        });

        it("should eventually return an array of numbers when multiple items of that name are found", function () {
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

            return expect(sut.getByName(multipleItems))
                .to.eventually.be.an("array")
                .and.to.have.lengthOf(2)
                .and.to.have.members([2, 3]);
        });
    });
});
