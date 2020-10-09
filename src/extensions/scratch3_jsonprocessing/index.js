/* eslint-disable no-unused-vars */
/* eslint-disable comma-dangle */
/* eslint-disable object-curly-spacing */
/* eslint-disable arrow-parens */
/* eslint-disable space-before-function-paren */
/* eslint-disable quotes */

const ArgumentType = require("../../extension-support/argument-type");
const BlockType = require("../../extension-support/block-type");
const log = require("../../util/log");

class Scratch3JsonprocessingBlocks {
    constructor(runtime) {
        this.runtime = runtime;
        this.result = "";
    }

    getInfo() {
        return {
            id: "jsonprocessing",
            name: "JSON",
            blocks: [
                {
                    opcode: "objectextract",
                    blockType: BlockType.COMMAND,
                    text: "[JSON]から[KEY]を取り出す",
                    arguments: {
                        JSON: {
                            type: ArgumentType.STRING,
                            defaultValue: '{"key": "value"}',
                        },
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: "key",
                        },
                    },
                },
                {
                    opcode: "arrayindex",
                    blockType: BlockType.COMMAND,
                    text: "[JSON]から要素[INDEX]を取り出す",
                    arguments: {
                        JSON: {
                            type: ArgumentType.STRING,
                            defaultValue: '["a", "b", "c"]',
                        },
                        INDEX: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                    },
                },
                {
                    opcode: "modify",
                    blockType: BlockType.COMMAND,
                    text: "[JSON]の[KEY]を[VALUE]にする",
                    arguments: {
                        JSON: {
                            type: ArgumentType.STRING,
                            defaultValue: '{"key": "value"}',
                        },
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: "key",
                        },
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: "hello!",
                        },
                    },
                },
                {
                    opcode: "response",
                    text: "JSON",
                    blockType: BlockType.REPORTER,
                },
            ],
            menus: {},
        };
    }

    objectextract(args) {
        const obj = JSON.parse(args.JSON);
        this.result = JSON.stringify(obj[args.KEY]);
    }

    arrayindex(args) {
        const obj = JSON.parse(args.JSON);
        this.result = JSON.stringify(obj[args.INDEX]);
    }

    modify(args) {
        const obj = JSON.parse(args.JSON);
        obj[args.KEY] = args.VALUE;
        this.result = JSON.stringify(obj);
    }

    response(args) {
        return this.result;
    }
}

module.exports = Scratch3JsonprocessingBlocks;
