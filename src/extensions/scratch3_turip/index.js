const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const log = require('../../util/log');
const nets = require('nets');

class Scratch3NewBlocks {
    constructor (runtime) {
        this.runtime = runtime;
    }

    getInfo () {
        return {
            id: 'turip',
            name: 'TURIP',
            blocks: [
                {
                    opcode: 'LED',
                    blockType: BlockType.COMMAND,
                    text: 'LED [COLOR] を [BRIGHTNESS] にする',
                    arguments: {
                        COLOR: {
                            type: ArgumentType.STRING,
                            menu: 'colors',
                        },

                        BRIGHTNESS: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                }
            ],
            menus: {
                'colors': this.getColors()
            }
        };
    }

    LED (args){
        const ajaxPromise = new Promise(resolve => {
            nets({
                method: "PUT",
                url: 'http://localhost:3000/1001/1',
                body: `{"port": ${args.COLOR}, "data": ${args.BRIGHTNESS}}`,
                headers: { "Content-Type": "application/json" }
            }, function(err, res, body){
                resolve(body);
               return body;
            });
        });
        ajaxPromise.then(result => log.log(Cast.toString(result)));
        return ajaxPromise;
    }

    getColors () {
        return [
            {text: "あか", value: 1}, {text: "みどり", value: 2},{text: "あお", value: 3}
        ]
    }
}

module.exports = Scratch3NewBlocks;