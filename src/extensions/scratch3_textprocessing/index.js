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
            id: "textprocessing",
            name: "Text",
            blocks: [
                {
                    opcode: "trim",
                    blockType: BlockType.COMMAND,
                    text: "[TEXT]の両端から空白を削除する",
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: " Hello! ",
                        },
                    },
                },
                {
                    opcode: "trimchar",
                    blockType: BlockType.COMMAND,
                    text: "[TEXT]の両端から[CHAR]を削除する",
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: '"Hello!"',
                        },
                        CHAR: {
                            type: ArgumentType.STRING,
                            defaultValue: '"',
                        },
                    },
                },
                {
                    opcode: "response",
                    text: "Text",
                    blockType: BlockType.REPORTER,
                },
            ],
            menus: {},
        };
    }

    trim(args) {
        this.result = args.TEXT.trim();
    }

    trimchar(args) {
        const reg = new RegExp(
            ["^[", args.CHAR, "]+|[", args.CHAR, "]+$"].concat(),
            "g"
        );
        this.result = args.TEXT.replace(reg, "");
    }

    response(args) {
        return this.result;
    }
}

module.exports = Scratch3JsonprocessingBlocks;
