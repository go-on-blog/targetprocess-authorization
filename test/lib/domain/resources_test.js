/*jslint
    es6, this
*/
"use strict";

const {after, before, describe, it} = require("mocha");

describe("resources", function () {
    const chai = require("chai");
    const expect = chai.expect;
    const chaiAsPromised = require("chai-as-promised");
    const sinon = require("sinon");
    const resourceName = "Projects";
    const resources = require("../../../lib/domain/resources");
    const {domain, token} = require("../../credentials");
    const uri = `https://${domain}/api/v1`;
    const retrieve = require("targetprocess-api/retrieve")(uri, token, resourceName);
    const stampit = require("@stamp/it");
    const factory = stampit(resources, {props: {retrieve}});
    var stub;

    chai.use(chaiAsPromised);

    before(function () {
        stub = sinon.stub(retrieve, "get");
        stub.onFirstCall().returns(Promise.resolve([]));
        stub.onSecondCall().returns(Promise.resolve([{Id: 1}]));
        stub.onThirdCall().returns(Promise.resolve([{Id: 2}, {Id: 3}]));
    });

    describe("getId", function () {
        // it("should return a fulfilled promise when the name includes a single quote", function () {
        //     const projects = stampit().props({resource: "Projects"});
        //     const factory = stampit(resources, projects);
        //     const sut = factory(credentials);
        //     const hasQuote = "isn't it";

        //     return expect(sut.getId(hasQuote)).to.be.fulfilled;
        // });

        it("should return null when no resource of that name is found", function () {
            // Not finding the expected resource should not be considered as an
            // exceptional situation. For instance, a user may have deleted the
            // resource on purpose. So we don't reject the promise but return
            // a failure value (null).
            // See https://github.com/domenic/promises-unwrapping/blob/master/docs/writing-specifications-with-promises.md#rejections-should-be-used-for-exceptional-situations
            const sut = factory();

            return expect(sut.getId("first call"))
                .to.eventually.be.null;
        });

        it("should return a number when one single resource of that name is found", function () {
            const sut = factory();

            return expect(sut.getId("second call"))
                .to.eventually.be.a("number")
                .and.to.equal(1);
        });

        it("should return an array of numbers when multiple resources of that name are found", function () {
            const sut = factory();

            return expect(sut.getId("third call"))
                .to.eventually.be.an("array")
                .and.to.have.lengthOf(2)
                .and.to.have.members([2, 3]);
        });


    });

    after(function () {
        stub.restore();
    });
});
