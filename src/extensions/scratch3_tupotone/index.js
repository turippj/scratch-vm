/* eslint-disable no-unused-vars */
/* eslint-disable comma-dangle */
/* eslint-disable object-curly-spacing */
/* eslint-disable arrow-parens */
/* eslint-disable space-before-function-paren */
/* eslint-disable quotes */

const ArgumentType = require("../../extension-support/argument-type");
const BlockType = require("../../extension-support/block-type");
const log = require("../../util/log");

const AsyncLock = require("async-lock");
let lock = new AsyncLock();

const WSSendInterval = 200;
const TURIP_WRITE = 0x80;
const TURIP_TYPE_TRUE = 0x01;
const TURIP_TYPE_FALSE = 0x00;

let TupotOneButtonA = false;
let TupotOneButtonB = false;
let TupotOneAccelerationX = 0.0;
let TupotOneAccelerationY = 0.0;
let TupotOneAccelerationZ = 0.0;
let TupotOneGyroX = 0.0;
let TupotOneGyroY = 0.0;
let TupotOneGyroZ = 0.0;
let AirSensorTemperature = 0.0;
let AirSensorHumidity = 0.0;
let AirSensorPressure = 0.0;
let ColorSensorBrightness = 0;
let ColorSensorColorR = 0;
let ColorSensorColorG = 0;
let ColorSensorColorB = 0;
let DistanceSensorDistance = 0;
let GpioDigital = [0, 0, 0, 0, 0, 0];
let GpioAnalog = [0, 0, 0, 0, 0, 0];

let url = "";
let rgbcmy = "";
let ws;
let wsIsOpen = false;
let weIsEnable = false;

const rgbcmyToUrl = (rgb) => ["ws://tupot-", rgb, ".local/turip/ws"].join("");

const ValidateIPaddress = (ipaddress) => {
    if (
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
            ipaddress
        )
    ) {
        return true;
    }
    return false;
};

const setWsUrl = () => {
    // eslint-disable-next-line no-alert
    rgbcmy = window.prompt("Tupot ONE LED (rgbcmy)", "");
    if (ValidateIPaddress(rgbcmy) === true) {
        url = ["ws://", rgbcmy, "/turip/ws"].join("");
    } else {
        url = rgbcmyToUrl(rgbcmy);
    }
};

const wsBegin = (wsUrl) => {
    let intervalId;
    if (weIsEnable === false) {
        weIsEnable = true;
        ws = new WebSocket(wsUrl);
        ws.binaryType = "arraybuffer";
        ws.onopen = (event) => {
            log.log("[Tupot] Websocket is opened.");
            wsIsOpen = true;
            intervalId = setInterval(() => {
                const buf = new ArrayBuffer(1);
                const port = new DataView(buf, 0);
                port.setUint8(0, 63);
                ws.send(buf);
            }, WSSendInterval);
        };
        ws.onerror = (event) => {
            log.log("[Tupot] Websocket error occurred.");
            ws.close();
        };
        ws.onclose = (event) => {
            log.log("[Tupot] Websocket is closed.");
            wsIsOpen = false;
            clearInterval(intervalId);
            setTimeout(() => {
                weIsEnable = false;
                wsBegin(url);
            }, 1000);
        };
        ws.onmessage = (event) => {
            // log.log(event);
            const status = new DataView(event.data, 0).getUint8(0);
            const port = new DataView(event.data, 1).getUint8(0);
            const data = new DataView(event.data, 2);

            if (port === 4) {
                if ((status & 0x0f) === TURIP_TYPE_TRUE) {
                    TupotOneButtonA = true;
                } else {
                    TupotOneButtonA = false;
                }
            }
            if (port === 5) {
                if ((status & 0x0f) === TURIP_TYPE_TRUE) {
                    TupotOneButtonB = true;
                } else {
                    TupotOneButtonB = false;
                }
            }
            if (port === 6) {
                TupotOneAccelerationX = data.getFloat32(0, true);
            }
            if (port === 7) {
                TupotOneAccelerationY = data.getFloat32(0, true);
            }
            if (port === 8) {
                TupotOneAccelerationZ = data.getFloat32(0, true);
            }
            if (port === 9) {
                TupotOneGyroX = data.getFloat32(0, true);
            }
            if (port === 10) {
                TupotOneGyroY = data.getFloat32(0, true);
            }
            if (port === 11) {
                TupotOneGyroZ = data.getFloat32(0, true);
            }
            if (port === 13) {
                AirSensorTemperature = data.getFloat32(0, true);
            }
            if (port === 14) {
                AirSensorHumidity = data.getFloat32(0, true);
            }
            if (port === 15) {
                AirSensorPressure = data.getFloat32(0, true);
            }
            if (port === 17) {
                ColorSensorBrightness = data.getUint16(0, true);
            }
            if (port === 18) {
                ColorSensorColorR = data.getUint16(0, true);
            }
            if (port === 19) {
                ColorSensorColorG = data.getUint16(0, true);
            }
            if (port === 20) {
                ColorSensorColorB = data.getUint16(0, true);
            }
            if (port === 23) {
                DistanceSensorDistance = data.getUint16(0, true);
            }
            if (port === 63) {
                TupotOneAccelerationX = data.getFloat32(4, true);
                TupotOneAccelerationY = data.getFloat32(8, true);
                TupotOneAccelerationZ = data.getFloat32(12, true);
                TupotOneGyroX = data.getFloat32(16, true);
                TupotOneGyroY = data.getFloat32(20, true);
                TupotOneGyroZ = data.getFloat32(24, true);
                TupotOneButtonA = data.getUint8(28) !== 0;
                TupotOneButtonB = data.getUint8(29) !== 0;
            }
        };
    }
};

const TupotOneOnOff = {
    ON: "ON",
    OFF: "OFF",
};

const TupotOneAxis = {
    X: "X",
    Y: "Y",
    Z: "Z",
};

const TupotOneButtons = {
    A: "A",
    B: "B",
};

const TupotOneRGB = {
    R: "赤",
    G: "緑",
    B: "青",
};

class Scratch3TupotBlocks {
    constructor(runtime) {
        log.log("[Tupot] constructor(runtime) called.");
        this.runtime = runtime;
    }

    get MENU_TUPOTONE_BUTTONS() {
        return [
            {
                text: "A",
                value: TupotOneButtons.A,
            },
            {
                text: "B",
                value: TupotOneButtons.B,
            },
        ];
    }

    get MENU_ONOFF() {
        return [
            {
                text: "ON",
                value: TupotOneOnOff.ON,
            },
            {
                text: "OFF",
                value: TupotOneOnOff.OFF,
            },
        ];
    }

    get MENU_RGB() {
        return [
            {
                text: TupotOneRGB.R,
                value: TupotOneRGB.R,
            },
            {
                text: TupotOneRGB.G,
                value: TupotOneRGB.G,
            },
            {
                text: TupotOneRGB.B,
                value: TupotOneRGB.B,
            },
        ];
    }

    get MENU_AXIS() {
        return [
            {
                text: "X",
                value: TupotOneAxis.X,
            },
            {
                text: "Y",
                value: TupotOneAxis.Y,
            },
            {
                text: "Z",
                value: TupotOneAxis.Z,
            },
        ];
    }

    get MENU_MOTOR_CH() {
        return [
            {
                text: "1",
                value: 1,
            },
            {
                text: "2",
                value: 2,
            },
            {
                text: "3",
                value: 3,
            },
            {
                text: "4",
                value: 4,
            },
            {
                text: "5",
                value: 5,
            },
            {
                text: "6",
                value: 6,
            },
        ];
    }

    get MENU_GPIO_IO() {
        return [
            {
                text: "1",
                value: 1,
            },
            {
                text: "2",
                value: 2,
            },
            {
                text: "3",
                value: 3,
            },
            {
                text: "4",
                value: 4,
            },
            {
                text: "5",
                value: 5,
            },
            {
                text: "6",
                value: 6,
            },
        ];
    }

    getInfo() {
        log.log("[Tupot] getInfo() called.");
        if (url === "") {
            setWsUrl();
        }
        wsBegin(url);
        return {
            id: "tupotone",
            name: "TupotOne",
            blocks: [
                // {
                //     opcode: "TupotOneConnect",
                //     blockType: BlockType.COMMAND,
                //     text: "[RGBCMY] に接続する",
                //     arguments: {
                //         RGBCMY: {
                //             type: ArgumentType.STRING,
                //             defaultValue: rgbcmy,
                //         },
                //     },
                // },
                // {
                //     opcode: "TupotOneDisconnect",
                //     blockType: BlockType.COMMAND,
                //     text: "切断する",
                //     arguments: {},
                // },
                // {
                //     opcode: "TupotOneValueIsConnect",
                //     text: "接続",
                //     blockType: BlockType.REPORTER,
                // },
                // "---",
                // {
                //     opcode: "TupotOneWriteLedStatus",
                //     blockType: BlockType.COMMAND,
                //     text: "ステータスLED [ONOFF]",
                //     arguments: {
                //         ONOFF: {
                //             type: ArgumentType.STRING,
                //             defaultValue: "OFF",
                //             menu: "onoff",
                //         },
                //     },
                // },
                {
                    opcode: "TupotOneWriteRgbLed",
                    blockType: BlockType.COMMAND,
                    text: "RGBLED R:[RED] G:[GREEN] B:[BLUE] (0-255)",
                    arguments: {
                        RED: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        GREEN: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        BLUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                    },
                },
                {
                    opcode: "TupotOneValueButtons",
                    text: "ボタン[BUTTON]",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        BUTTON: {
                            type: ArgumentType.STRING,
                            menu: "buttons",
                            defaultValue: TupotOneButtons.A,
                        },
                    },
                },
                {
                    opcode: "TupotOneValueAcceleration",
                    text: "加速度[AXIS]",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        AXIS: {
                            type: ArgumentType.STRING,
                            menu: "axis",
                            defaultValue: "X",
                        },
                    },
                },
                {
                    opcode: "TupotOneValueGyro",
                    text: "角加速度[AXIS]",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        AXIS: {
                            type: ArgumentType.STRING,
                            menu: "axis",
                            defaultValue: "X",
                        },
                    },
                },
                "---",
                // {
                //     opcode: "AirSensorWriteLedStatus",
                //     blockType: BlockType.COMMAND,
                //     text: "AirSensor: ステータスLED (0,1) [BRIGHTNESS]",
                //     arguments: {
                //         BRIGHTNESS: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: 0,
                //         },
                //     },
                // },
                {
                    opcode: "AirSensorReadTemperature",
                    blockType: BlockType.COMMAND,
                    text: "空気センサ: 気温を取得",
                    arguments: {},
                },
                {
                    opcode: "AirSensorValueTemperature",
                    text: "空気センサ: 気温",
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: "AirSensorReadHumidity",
                    blockType: BlockType.COMMAND,
                    text: "空気センサ: 湿度を取得",
                    arguments: {},
                },
                {
                    opcode: "AirSensorValueHumidity",
                    text: "空気センサ: 湿度",
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: "AirSensorReadPressure",
                    blockType: BlockType.COMMAND,
                    text: "空気センサ: 気圧を取得",
                    arguments: {},
                },
                {
                    opcode: "AirSensorValuePressure",
                    text: "空気センサ: 気圧",
                    blockType: BlockType.REPORTER,
                },
                "---",
                // {
                //     opcode: "ColorSensorWriteLedStatus",
                //     blockType: BlockType.COMMAND,
                //     text: "ColorSensor: ステータスLED (0,1) [BRIGHTNESS]",
                //     arguments: {
                //         BRIGHTNESS: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: 0,
                //         },
                //     },
                // },
                {
                    opcode: "ColorSensorReadBrightness",
                    blockType: BlockType.COMMAND,
                    text: "光センサ: 明るさを取得",
                    arguments: {},
                },
                {
                    opcode: "ColorSensorValueBrightness",
                    text: "光センサ: 明るさ",
                    blockType: BlockType.REPORTER,
                },
                {
                    opcode: "ColorSensorReadColor",
                    blockType: BlockType.COMMAND,
                    text: "光センサ: [COLOR]色を取得",
                    arguments: {
                        COLOR: {
                            type: ArgumentType.STRING,
                            menu: "rgb",
                            defaultValue: TupotOneRGB.R,
                        },
                    },
                },
                {
                    opcode: "ColorSensorValueColor",
                    text: "光センサ: [COLOR]色",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        COLOR: {
                            type: ArgumentType.STRING,
                            menu: "rgb",
                            defaultValue: TupotOneRGB.R,
                        },
                    },
                },
                {
                    opcode: "ColorSensorWritePowerLED",
                    blockType: BlockType.COMMAND,
                    text: "光センサ: LEDライト[BRIGHTNESS]",
                    arguments: {
                        BRIGHTNESS: {
                            type: ArgumentType.NUMBER,
                            menu: "onoff",
                            defaultValue: TupotOneOnOff.OFF,
                        },
                    },
                },
                "---",
                // {
                //     opcode: "DistanceSensorWriteLedStatus",
                //     blockType: BlockType.COMMAND,
                //     text: "DistanceSensor: ステータスLED (0,1) [BRIGHTNESS]",
                //     arguments: {
                //         BRIGHTNESS: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: 0,
                //         },
                //     },
                // },
                {
                    opcode: "DistanceSensorReadDistance",
                    blockType: BlockType.COMMAND,
                    text: "距離センサ: 距離を取得",
                    arguments: {},
                },
                {
                    opcode: "DistanceSensorValueDistance",
                    text: "距離センサ: 距離",
                    blockType: BlockType.REPORTER,
                },
                "---",
                // {
                //     opcode: "MotorDriverWriteLedStatus",
                //     blockType: BlockType.COMMAND,
                //     text: "MotorDriver: ステータスLED (0,1) [BRIGHTNESS]",
                //     arguments: {
                //         BRIGHTNESS: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: 0,
                //         },
                //     },
                // },
                {
                    opcode: "MotorDriverWriteMotor",
                    blockType: BlockType.COMMAND,
                    text:
                        "モータードライバ: モーター [MOTOR] の出力 [OUTPUT] (0-255)",
                    arguments: {
                        MOTOR: {
                            type: ArgumentType.NUMBER,
                            menu: "motorChannel",
                            defaultValue: 1,
                        },
                        OUTPUT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                    },
                },
                "---",
                {
                    opcode: "GpioReadDigital",
                    blockType: BlockType.COMMAND,
                    text: "GPIO: IO[IO]のデジタル入力をする",
                    arguments: {
                        IO: {
                            type: ArgumentType.NUMBER,
                            menu: "gpioIo",
                            defaultValue: 1,
                        },
                    },
                },
                {
                    opcode: "GpioValueDigital",
                    text: "GPIO: IO[IO]のデジタル入力",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        IO: {
                            type: ArgumentType.NUMBER,
                            menu: "gpioIo",
                            defaultValue: 1,
                        },
                    },
                },
                {
                    opcode: "GpioWriteDigital",
                    blockType: BlockType.COMMAND,
                    text: "GPIO: IO[IO]へ[OUTPUT]をデジタル出力する",
                    arguments: {
                        IO: {
                            type: ArgumentType.NUMBER,
                            menu: "gpioIo",
                            defaultValue: 1,
                        },
                        OUTPUT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                    },
                },
                {
                    opcode: "GpioReadAnalog",
                    blockType: BlockType.COMMAND,
                    text: "GPIO: IO[IO]のアナログ入力をする",
                    arguments: {
                        IO: {
                            type: ArgumentType.NUMBER,
                            menu: "gpioIo",
                            defaultValue: 1,
                        },
                    },
                },
                {
                    opcode: "GpioValueAnalog",
                    text: "GPIO: IO[IO]のアナログ入力",
                    blockType: BlockType.REPORTER,
                    arguments: {
                        IO: {
                            type: ArgumentType.NUMBER,
                            menu: "gpioIo",
                            defaultValue: 1,
                        },
                    },
                },
            ],
            menus: {
                onoff: this.MENU_ONOFF,
                axis: this.MENU_AXIS,
                buttons: this.MENU_TUPOTONE_BUTTONS,
                rgb: this.MENU_RGB,
                motorChannel: this.MENU_MOTOR_CH,
                gpioIo: this.MENU_GPIO_IO,
            },
        };
    }

    TupotOneDisconnect(args) {}

    TupotOneConnect(args) {
        url = rgbcmyToUrl(args.RGBCMY);
        wsBegin(url);
    }

    TupotOneValueIsConnect() {
        return wsIsOpen;
    }

    TupotOneReadPort(port) {
        const _buf = new ArrayBuffer(1);
        const _port = new DataView(_buf, 0);
        _port.setUint8(0, port);
        ws.send(_buf);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, WSSendInterval);
        });
    }

    TupotOneWritePort(dataframe) {
        ws.send(dataframe);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, WSSendInterval);
        });
    }

    TupotOneReadState(args) {
        return this.TupotOneReadPort(63);
    }

    TupotOneWriteLedStatus(args) {
        const buf = new ArrayBuffer(2);
        const port = new DataView(buf, 0);
        const body = new DataView(buf, 1);
        port.setUint8(0, TURIP_WRITE | 0);
        body.setUint8(0, args.BRIGHTNESS);
        return this.TupotOneWritePort(buf);
    }

    TupotOneWriteRgbLed(args) {
        const buf = new ArrayBuffer(4);
        const port = new DataView(buf, 0);
        const body = new DataView(buf, 1);
        port.setUint8(0, TURIP_WRITE | 62);
        body.setUint8(0, args.RED);
        body.setUint8(1, args.GREEN);
        body.setUint8(2, args.BLUE);
        return this.TupotOneWritePort(buf);
    }

    TupotOneValueButtons(args) {
        if (args.BUTTON === TupotOneButtons.A) {
            return TupotOneButtonA;
        }
        if (args.BUTTON === TupotOneButtons.B) {
            return TupotOneButtonB;
        }
        return false;
    }

    TupotOneValueAcceleration(args) {
        if (args.AXIS === TupotOneAxis.X) {
            return Math.round(TupotOneAccelerationX * 100) / 100.0;
        }
        if (args.AXIS === TupotOneAxis.Y) {
            return Math.round(TupotOneAccelerationY * 100) / 100.0;
        }
        if (args.AXIS === TupotOneAxis.Z) {
            return Math.round(TupotOneAccelerationZ * 100) / 100.0;
        }
        return false;
    }

    TupotOneValueGyro(args) {
        if (args.AXIS === TupotOneAxis.X) {
            return Math.round(TupotOneGyroX * 100) / 100.0;
        }
        if (args.AXIS === TupotOneAxis.Y) {
            return Math.round(TupotOneGyroY * 100) / 100.0;
        }
        if (args.AXIS === TupotOneAxis.Z) {
            return Math.round(TupotOneGyroZ * 100) / 100.0;
        }
    }

    AirSensorWriteLedStatus(args) {
        const buf = new ArrayBuffer(2);
        const port = new DataView(buf, 0);
        const body = new DataView(buf, 1);
        port.setUint8(0, TURIP_WRITE | 12);
        body.setUint8(0, args.BRIGHTNESS);
        ws.send(buf);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, WSSendInterval);
        });
    }

    AirSensorReadTemperature(args) {
        const buf = new ArrayBuffer(1);
        const port = new DataView(buf, 0);
        port.setUint8(0, 13);
        ws.send(buf);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, WSSendInterval);
        });
    }

    AirSensorReadHumidity(args) {
        const buf = new ArrayBuffer(1);
        const port = new DataView(buf, 0);
        port.setUint8(0, 14);
        ws.send(buf);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, WSSendInterval);
        });
    }

    AirSensorReadPressure(args) {
        const buf = new ArrayBuffer(1);
        const port = new DataView(buf, 0);
        port.setUint8(0, 15);
        ws.send(buf);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, WSSendInterval);
        });
    }

    AirSensorValueTemperature() {
        return AirSensorTemperature;
    }

    AirSensorValueHumidity() {
        return AirSensorHumidity;
    }

    AirSensorValuePressure() {
        return AirSensorPressure;
    }

    ColorSensorWriteLedStatus(args) {
        const buf = new ArrayBuffer(2);
        const port = new DataView(buf, 0);
        const body = new DataView(buf, 1);
        port.setUint8(0, TURIP_WRITE | 16);
        body.setUint8(0, args.BRIGHTNESS);
        ws.send(buf);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, WSSendInterval);
        });
    }

    ColorSensorReadBrightness(args) {
        const buf = new ArrayBuffer(1);
        const port = new DataView(buf, 0);
        port.setUint8(0, 17);
        ws.send(buf);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, WSSendInterval);
        });
    }

    ColorSensorReadColor(args) {
        const buf = new ArrayBuffer(1);
        const port = new DataView(buf);
        if (args.COLOR === TupotOneRGB.R) {
            port.setUint8(0, 18);
        } else if (args.COLOR === TupotOneRGB.G) {
            port.setUint8(0, 19);
        } else {
            port.setUint8(0, 20);
        }
        ws.send(buf);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, WSSendInterval);
        });
    }

    ColorSensorWritePowerLED(args) {
        const buf = new ArrayBuffer(2);
        const port = new DataView(buf, 0);
        const body = new DataView(buf, 1);
        port.setUint8(0, TURIP_WRITE | 21);
        if (args.BRIGHTNESS === TupotOneOnOff.ON) {
            body.setUint8(0, 1);
        } else {
            body.setUint8(0, 0);
        }
        ws.send(buf);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, WSSendInterval);
        });
    }

    ColorSensorValueBrightness() {
        return ColorSensorBrightness;
    }

    ColorSensorValueColor(args) {
        if (args.COLOR === TupotOneRGB.R) {
            return ColorSensorColorR;
        } else if (args.COLOR === TupotOneRGB.G) {
            return ColorSensorColorG;
        }
        return ColorSensorColorB;
    }

    DistanceSensorWriteLedStatus(args) {
        const buf = new ArrayBuffer(2);
        const port = new DataView(buf, 0);
        const body = new DataView(buf, 1);
        port.setUint8(0, TURIP_WRITE | 22);
        body.setUint8(0, args.BRIGHTNESS);
        ws.send(buf);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, WSSendInterval);
        });
    }

    DistanceSensorReadDistance(args) {
        const buf = new ArrayBuffer(1);
        const port = new DataView(buf, 0);
        port.setUint8(0, 23);
        ws.send(buf);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, WSSendInterval);
        });
    }

    DistanceSensorValueDistance() {
        return DistanceSensorDistance;
    }

    MotorDriverWriteLedStatus(args) {
        const buf = new ArrayBuffer(2);
        const port = new DataView(buf, 0);
        const body = new DataView(buf, 1);
        port.setUint8(0, TURIP_WRITE | 24);
        body.setUint8(0, args.BRIGHTNESS);
        ws.send(buf);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, WSSendInterval);
        });
    }

    MotorDriverWriteMotor(args) {
        const buf = new ArrayBuffer(2);
        const port = new DataView(buf, 0);
        const body = new DataView(buf, 1);
        const portnum = 24 + parseInt(args.MOTOR, 10);
        log.log(portnum);
        port.setUint8(0, TURIP_WRITE | portnum);
        body.setUint8(0, args.OUTPUT);
        ws.send(buf);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, WSSendInterval);
        });
    }

    GpioReadDigital(args) {
        const buf = new ArrayBuffer(1);
        const port = new DataView(buf, 0);
        const portnum = 30 + parseInt(args.IO, 10);
        port.setUint8(0, portnum);
        ws.send(buf);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, WSSendInterval);
        });
    }

    GpioValueDigital(args) {
        const portnum = parseInt(args.IO, 10) - 1;
        return GpioDigital[portnum];
    }

    GpioReadAnalog(args) {
        const buf = new ArrayBuffer(1);
        const port = new DataView(buf, 0);
        const portnum = 36 + parseInt(args.IO, 10);
        port.setUint8(0, portnum);
        ws.send(buf);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, WSSendInterval);
        });
    }

    GpioValueAnalog(args) {
        const portnum = parseInt(args.IO, 10) - 1;
        return GpioAnalog[portnum];
    }

    GpioWriteDigital(args) {
        const buf = new ArrayBuffer(2);
        const port = new DataView(buf, 0);
        const body = new DataView(buf, 1);
        const portnum = 30 + parseInt(args.IO, 10);
        port.setUint8(0, TURIP_WRITE | portnum);
        body.setUint8(0, args.OUTPUT);
        ws.send(buf);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, WSSendInterval);
        });
    }
}

module.exports = Scratch3TupotBlocks;
