const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const log = require('../../util/log');
const nets = require('nets');

let _enviroment = [0,0,0];
let _brightness = [0,0];
let _distance = 0;


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
                },

                {
                    opcode: 'APDS9960',
                    blockType: BlockType.COMMAND,
                    text: '[BRIGHTNESS] をはかる',
                    arguments: {
                        BRIGHTNESS: {
                            type: ArgumentType.STRING,
                            menu: 'brightnesses',
                        }
                    }
                },
                {
                    opcode: 'APDS9960value',
                    text: '[BRIGHTNESS] をみる',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        BRIGHTNESS: {
                            type: ArgumentType.STRING,
                            menu: 'brightnesses'
                        }
                    }
                },

                {
                    opcode: 'BME280',
                    blockType: BlockType.COMMAND,
                    text: '[ENVIROMENT] をはかる',
                    arguments: {
                        ENVIROMENT: {
                            type: ArgumentType.STRING,
                            menu: 'enviroments',
                        }
                    }
                },
                {
                    opcode: 'BME280value',
                    text: '[ENVIROMENT] をみる',
                    blockType: BlockType.REPORTER,
                    arguments: {
                        ENVIROMENT: {
                            type: ArgumentType.STRING,
                            menu: 'enviroments'
                        }
                    }
                },

                {
                    opcode: 'VL53L1X',
                    blockType: BlockType.COMMAND,
                    text: 'きょりをはかる'
                },
                {
                    opcode: 'VL53L1Xvalue',
                    text: 'きょりをみる',
                    blockType: BlockType.REPORTER
                },

                {
                    opcode: 'DRV8835',
                    text: 'モーター [PORT] をつよさ [POWER] で回す',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'motors',
                        },

                        POWER: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'DRV8835stop',
                    text: 'モーター [PORT] をとめる',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PORT: {
                            type: ArgumentType.STRING,
                            menu: 'motors',
                        }
                    }
                },
            ],

            menus: {
                'colors': [ {text: "あか", value: 1}, {text: "みどり", value: 2},{text: "あお", value: 3} ],
                'enviroments': [ {text: "おんど", value: 1}, {text: "しつど", value: 2},{text: "きあつ", value: 3} ],
                'motors': [ {text: "1", value: 1}, {text: "2", value: 2}],
                'brightnesses': [ {text: "あかるさ", value: 1}, {text: "ちかさ", value: 2}]
            }
        };
    }

    VL53L1X () {
        const ajaxPromise = new Promise(resolve => {
            nets({
                method: "GET",
                url: `http://localhost:3000/112d4/1/1`,
                headers: { "Content-Type": "application/json" }
            }, function(err, res, body){
                resolve(body);
               return body;
            });
        });
        ajaxPromise.then(result => _distance = result );
        return ajaxPromise;
    }

    VL53L1Xvalue () {
        return _distance;
    }

    DRV8835 (args) {
        const ajaxPromise = new Promise(resolve => {
            nets({
                method: "PUT",
                url: 'http://localhost:3000/12e48/1',
                body: `{"port": ${args.PORT}, "data": ${args.POWER}}`,
                headers: { "Content-Type": "application/json" }
            }, function(err, res, body){
                resolve(body);
               return body;
            });
        });
        ajaxPromise.then(result => log.log(Cast.toString(result)));
        return ajaxPromise;
    }

    DRV8835stop (args) {
        const ajaxPromise = new Promise(resolve => {
            nets({
                method: "PUT",
                url: 'http://localhost:3000/12e48/1',
                body: `{"port": ${args.PORT}, "data": 0}`,
                headers: { "Content-Type": "application/json" }
            }, function(err, res, body){
                resolve(body);
               return body;
            });
        });
        ajaxPromise.then(result => log.log(Cast.toString(result)));
        return ajaxPromise;
    }


    BME280 (args) {
        const ajaxPromise = new Promise(resolve => {
            nets({
                method: "GET",
                url: `http://localhost:3000/12d10/1/${args.ENVIROMENT}`,
                headers: { "Content-Type": "application/json" }
            }, function(err, res, body){
                resolve(body);
               return body;
            });
        });
        ajaxPromise.then(result => _enviroment[args.ENVIROMENT] = result );
        return ajaxPromise;
    }

    BME280value (args) {
        return _enviroment[args.ENVIROMENT];
    }

    APDS9960 (args) {
        const ajaxPromise = new Promise(resolve => {
            nets({
                method: "GET",
                url: `http://localhost:3000/14e67/1/${args.BRIGHTNESS}`,
                headers: { "Content-Type": "application/json" }
            }, function(err, res, body){
                resolve(body);
               return body;
            });
        });
        ajaxPromise.then(result => _brightness[args.BRIGHTNESS] = result );
        return ajaxPromise;
    }

    APDS9960value (args) {
        return _brightness[args.BRIGHTNESS];
    }

    LED (args){
        const ajaxPromise = new Promise(resolve => {
            nets({
                method: "PUT",
                url: 'http://localhost:3000/1b09a/1',
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
}

module.exports = Scratch3NewBlocks;