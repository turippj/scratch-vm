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
            id: 'newblocks',
            name: 'New Blocks',
            blocks: [
                {
                    opcode: 'ajaxRequest',
                    blockType: BlockType.HAT,
                    text: 'get [URL]',
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: "hello"
                        }
                    }
                }
            ],
            menus: {
            }
        };
    }

    ajaxRequest (args){
        const ajaxPromise = new Promise(resolve => {
            nets({
                url: Cast.toString(args.URL)
            }, function(err, res, body){
                resolve(body);
               return body;
            });
        });
        ajaxPromise.then(result => log.log(Cast.toString(result)));
        return ajaxPromise;
    }
}

module.exports = Scratch3NewBlocks;