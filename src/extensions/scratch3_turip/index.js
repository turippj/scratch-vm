const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const log = require('../../util/log');
const nets = require('nets');

// let _enviroment = [0,0,0];
// let _brightness = [0,0];
// let _distance = 0;
let url = "";
let ws;

class Scratch3NewBlocks {
    constructor (runtime) {
        this.runtime = runtime;
    }

    get COLOR_INFO () {
        return {1: "あか", 2: "みどり", 3: "あお"};
    }

    // get ENVIROMENT_INFO() {
    //     return {1: "おんど", 2: "しつど", 3: "きあつ"};
    // }

    // get MOTOR_INFO() {
    //     return {1: "1", 2: "2"};
    // }

    // get BRIGHTNESS_INFO() {
    //     return {1: "あかるさ", 2: "ちかさ"};
    // }


    getInfo () {
        if (url === "") {
            url = window.prompt("TURIP bridge URL:", "");
            ws = new WebSocket(url);
            ws.binaryType = "arraybuffer";
        }
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
                            defaultValue: 1
                        },

                        BRIGHTNESS: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },

                // {
                //     opcode: 'APDS9960',
                //     blockType: BlockType.COMMAND,
                //     text: '[BRIGHTNESS] をはかる',
                //     arguments: {
                //         BRIGHTNESS: {
                //             type: ArgumentType.STRING,
                //             menu: 'brightnesses',
                //             defaultValue: 1
                //         }
                //     }
                // },

                // {
                //     opcode: 'APDS9960brightness',
                //     text: 'あかるさ',
                //     blockType: BlockType.REPORTER,
                // },

                // {
                //     opcode: 'APDS9960distance',
                //     text: 'ちかさ',
                //     blockType: BlockType.REPORTER,
                // },

                // {
                //     opcode: 'BME280',
                //     blockType: BlockType.COMMAND,
                //     text: '[ENVIROMENT] をはかる',
                //     arguments: {
                //         ENVIROMENT: {
                //             type: ArgumentType.STRING,
                //             menu: 'enviroments',
                //             defaultValue: 1
                //         }
                //     }
                // },

                // {
                //     opcode: 'BME280temp',
                //     text: 'おんど',
                //     blockType: BlockType.REPORTER
                // },

                // {
                //     opcode: 'BME280humid',
                //     text: 'しつど',
                //     blockType: BlockType.REPORTER
                // },

                // {
                //     opcode: 'BME280press',
                //     text: 'きあつ',
                //     blockType: BlockType.REPORTER
                // },

                // {
                //     opcode: 'VL53L1X',
                //     blockType: BlockType.COMMAND,
                //     text: 'きょりをはかる'
                // },
                // {
                //     opcode: 'VL53L1Xvalue',
                //     text: 'きょり',
                //     blockType: BlockType.REPORTER
                // },

                // {
                //     opcode: 'DRV8835',
                //     text: 'モーター [PORT] をつよさ [POWER] で回す',
                //     blockType: BlockType.COMMAND,
                //     arguments: {
                //         PORT: {
                //             type: ArgumentType.STRING,
                //             menu: 'motors',
                //             defaultValue: 1
                //         },

                //         POWER: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: 0
                //         }
                //     }
                // },
                // {
                //     opcode: 'DRV8835stop',
                //     text: 'モーター [PORT] をとめる',
                //     blockType: BlockType.COMMAND,
                //     arguments: {
                //         PORT: {
                //             type: ArgumentType.STRING,
                //             menu: 'motors',
                //             defaultValue: 1
                //         }
                //     }
                // },
            ],

            menus: {
                'colors': this.getColorMenu(),
                // 'enviroments': this.getEnviromentsMenu(),
                // 'motors': this.getMotorMenu(),
                // 'brightnesses': this.getBrightnessMenu()
            }
        };
    }

    // VL53L1X () {
    //     const ajaxPromise = new Promise(resolve => {
    //         nets({
    //             method: "GET",
    //             url: `http://localhost:3000/112d4/1/1`,
    //             headers: { "Content-Type": "application/json" }
    //         }, function(err, res, body){
    //             resolve(body);
    //            return body;
    //         });
    //     });
    //     ajaxPromise.then(result => _distance = Number(result) );
    //     return ajaxPromise;
    // }

    // VL53L1Xvalue () {
    //     return _distance;
    // }

    // DRV8835 (args) {
    //     const ajaxPromise = new Promise(resolve => {
    //         nets({
    //             method: "PUT",
    //             url: 'http://localhost:3000/12e48/1',
    //             body: `{"port": ${args.PORT}, "data": ${args.POWER}}`,
    //             headers: { "Content-Type": "application/json" }
    //         }, function(err, res, body){
    //             resolve(body);
    //            return body;
    //         });
    //     });
    //     ajaxPromise.then(result => log.log(Cast.toString(result)));
    //     return ajaxPromise;
    // }

    // DRV8835stop (args) {
    //     const ajaxPromise = new Promise(resolve => {
    //         nets({
    //             method: "PUT",
    //             url: 'http://localhost:3000/12e48/1',
    //             body: `{"port": ${args.PORT}, "data": 0}`,
    //             headers: { "Content-Type": "application/json" }
    //         }, function(err, res, body){
    //             resolve(body);
    //            return body;
    //         });
    //     });
    //     ajaxPromise.then(result => log.log(Cast.toString(result)));
    //     return ajaxPromise;
    // }


    // BME280 (args) {
    //     const ajaxPromise = new Promise(resolve => {
    //         nets({
    //             method: "GET",
    //             url: `http://localhost:3000/12d10/1/${args.ENVIROMENT}`,
    //             headers: { "Content-Type": "application/json" }
    //         }, function(err, res, body){
    //             resolve(body);
    //            return body;
    //         });
    //     });
    //     ajaxPromise.then(result => _enviroment[args.ENVIROMENT] = Number(result) );
    //     return ajaxPromise;
    // }

    // BME280temp () {
    //     return _enviroment[1];
    // }

    // BME280humid () {
    //     return _enviroment[2];
    // }

    // BME280press () {
    //     return _enviroment[3];
    // }

    // APDS9960 (args) {
    //     const ajaxPromise = new Promise(resolve => {
    //         nets({
    //             method: "GET",
    //             url: `http://localhost:3000/14e67/1/${args.BRIGHTNESS}`,
    //             headers: { "Content-Type": "application/json" }
    //         }, function(err, res, body){
    //             resolve(body);
    //            return body;
    //         });
    //     });
    //     ajaxPromise.then(result => _brightness[args.BRIGHTNESS] = Number(result) );
    //     return ajaxPromise;
    // }

    // APDS9960brightness () {
    //     return _brightness[1];
    // }

    // APDS9960distance () {
    //     return _brightness[2];
    // }

    LED (args){
        const buf = new ArrayBuffer(2);
        const port = new DataView(buf, 0);
        const body = new DataView(buf, 1);
        port.setUint8(0, 0x80 | args.COLOR);
        body.setUint8(0, args.BRIGHTNESS);
        ws.send(buf);
        // const ajaxPromise = new Promise(resolve => {
        //     nets({
        //         method: "PUT",
        //         url: 'http://localhost:3000/1b09a/1',
        //         body: `{"port": ${args.COLOR}, "data": ${args.BRIGHTNESS}}`,
        //         headers: { "Content-Type": "application/json" }
        //     }, function(err, res, body){
        //         resolve(body);
        //        return body;
        //     });
        // });
        // ajaxPromise.then(result => log.log(Cast.toString(result)));
        // return ajaxPromise;
    }

    getColorMenu () {
        return Object.keys(this.COLOR_INFO).map(key => ({
            text: this.COLOR_INFO[key],
            value: key
        }));
    }

    // getEnviromentsMenu () {
    //     return Object.keys(this.ENVIROMENT_INFO).map(key => ({
    //         text: this.ENVIROMENT_INFO[key],
    //         value: key
    //     }));
    // }

    // getMotorMenu () {
    //     return Object.keys(this.MOTOR_INFO).map(key => ({
    //         text: this.MOTOR_INFO[key],
    //         value: key
    //     }));
    // }

    // getBrightnessMenu () {
    //     return Object.keys(this.BRIGHTNESS_INFO).map(key => ({
    //         text: this.BRIGHTNESS_INFO[key],
    //         value: key
    //     }));
    // }
}

module.exports = Scratch3NewBlocks;
