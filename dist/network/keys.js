"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Commands = exports.sendKeySequence = void 0;
const axios_1 = require("axios");
const network_1 = require("./network");
const utils_1 = require("../utils");
const sendKeyPress = async (key, delay) => {
    await axios_1.default.post(`${network_1.RokuAddress}keypress/${key}`);
    await (0, utils_1.sleep)(delay ?? 500);
};
const sendKeySequence = async (keypresses) => {
    for (const keypress of keypresses) {
        if (typeof keypress === 'string') {
            await sendKeyPress(keypress);
        }
        else if ('delay' in keypress && 'repeat' in keypress) {
            for (let i = 0; i < keypress.repeat; i++) {
                await sendKeyPress(keypress.key, keypress.delay);
            }
        }
        else if ('delay' in keypress) {
            await sendKeyPress(keypress.key, keypress.delay);
        }
    }
};
exports.sendKeySequence = sendKeySequence;
exports.Commands = {
    backlightDown: [
        'info',
        'down',
        'right',
        'down',
        'down',
        'right',
        { key: 'left', repeat: 100, delay: 0 },
        'info',
    ],
    backlightUp: [
        'info',
        'down',
        'right',
        'down',
        'down',
        'right',
        { key: 'right', repeat: 65, delay: 0 },
        'info',
    ],
};
//# sourceMappingURL=keys.js.map