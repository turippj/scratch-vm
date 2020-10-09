/* eslint-disable no-unused-vars */
/* eslint-disable comma-dangle */
/* eslint-disable object-curly-spacing */
/* eslint-disable arrow-parens */
/* eslint-disable space-before-function-paren */
/* eslint-disable quotes */

const ArgumentType = require("../../extension-support/argument-type");
const BlockType = require("../../extension-support/block-type");
const log = require("../../util/log");

const HAT_TIMEOUT = 100;

class Scratch3HttprestBlocks {
    constructor(runtime) {
        this.runtime = runtime;
        this.httpRequest = new XMLHttpRequest();
        this.httpResponseStatusCode = "";
        this.httpResponseHeader = "";
        this.httpResponseBody = "";
        this.responseReceived = false;
        this.httpRequest.onreadystatechange = () => {
            if (this.httpRequest.readyState === XMLHttpRequest.DONE) {
                this.httpResponseStatusCode = this.httpRequest.status;
                this.httpResponseHeader = this.httpRequest.getAllResponseHeaders();
                this.httpResponseBody = this.httpRequest.responseText;
                this.responseReceived = true;
            }
        };
    }

    getInfo() {
        return {
            id: "httprest",
            name: "HTTP REST",
            blocks: [
                {
                    opcode: "httpRequestGet",
                    blockType: BlockType.COMMAND,
                    text: "GET [URL]",
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: "http://",
                        },
                    },
                },
                {
                    opcode: "httpRequestPost",
                    blockType: BlockType.COMMAND,
                    text: "POST [URL] [TYPE] [BODY]",
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: "http://",
                        },
                        TYPE: {
                            type: ArgumentType.STRING,
                            defaultValue: "text/plain",
                        },
                        BODY: {
                            type: ArgumentType.STRING,
                            defaultValue: "Hello!",
                        },
                    },
                },
                {
                    opcode: "httpRequestPut",
                    blockType: BlockType.COMMAND,
                    text: "PUT [URL] [TYPE] [BODY]",
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: "http://",
                        },
                        TYPE: {
                            type: ArgumentType.STRING,
                            defaultValue: "text/plain",
                        },
                        BODY: {
                            type: ArgumentType.STRING,
                            defaultValue: "Hello!",
                        },
                    },
                },
                {
                    opcode: "httpRequestDelete",
                    blockType: BlockType.COMMAND,
                    text: "DELETE [URL]",
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: "http://",
                        },
                    },
                },
                {
                    opcode: "responseHat",
                    text: "レスポンスを受け取ったとき",
                    blockType: BlockType.HAT,
                },
                {
                    opcode: "responseBody",
                    text: "レスポンスの中身",
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: "responseCode",
                    text: "レスポンスステータスコード",
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: "responseHeader",
                    text: "レスポンスヘッダ",
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: "clearResponse",
                    blockType: BlockType.COMMAND,
                    text: "レスポンスを消す",
                },
            ],
            menus: {},
        };
    }

    httpRequestGet(args) {
        this.httpRequest.open("GET", args.URL);
        this.httpRequest.send();
    }

    httpRequestPost(args) {
        this.httpRequest.open("POST", args.URL);
        this.httpRequest.setRequestHeader("Content-Type", args.TYPE);
        this.httpRequest.send(args.BODY);
    }

    httpRequestPut(args) {
        this.httpRequest.open("PUT", args.URL);
        this.httpRequest.setRequestHeader("Content-Type", args.TYPE);
        this.httpRequest.send(args.BODY);
    }

    httpRequestDelete(args) {
        this.httpRequest.open("DELETE", args.URL);
        this.httpRequest.send();
    }

    responseHat(args) {
        if (this.responseReceived) {
            setTimeout(() => {
                this.responseReceived = false;
            }, HAT_TIMEOUT);
            return true;
        }
        return false;
    }

    responseCode(args) {
        return this.httpResponseStatusCode;
    }

    responseHeader(args) {
        return this.httpResponseHeader;
    }

    responseBody(args) {
        return this.httpResponseBody;
    }

    clearResponse(args) {
        this.httpResponseStatusCode = "";
        this.httpResponseHeader = "";
        this.httpResponseBody = "";
    }
}

module.exports = Scratch3HttprestBlocks;
