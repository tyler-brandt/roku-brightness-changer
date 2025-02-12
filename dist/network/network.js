"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckRokuAddress = exports.GetRokuAddress = exports.RokuAddress = void 0;
const axios_1 = require("axios");
const dgram_1 = require("dgram");
const xml2js_1 = require("xml2js");
const GetRokuAddress = async () => {
    return new Promise((resolve, reject) => {
        const MULTICAST_ADDRESS = '239.255.255.250';
        const MULTICAST_PORT = 1900;
        const socket = (0, dgram_1.createSocket)('udp4');
        const socketTimeout = setTimeout(() => {
            socket.close();
            console.log('Stopped listening for Roku devices');
        }, 10000);
        socket.on('message', (message, rinfo) => {
            const response = message.toString();
            if (response.includes('Roku')) {
                console.log(`Roku found at ${rinfo.address}:${rinfo.port}`);
                console.log('Response:\n', response);
                socket.close();
                clearTimeout(socketTimeout);
                const locationMatch = response.match(/LOCATION: (.*)/i);
                if (!locationMatch || !locationMatch[1]) {
                    reject(new Error('Could not parse LOCATION from roku device response'));
                    return;
                }
                exports.RokuAddress = locationMatch[1].trim();
                resolve(locationMatch[1].trim());
            }
        });
        socket.on('error', err => {
            console.error('Socket error:', err);
            reject(err);
        });
        socket.bind({
            port: 0,
            exclusive: false,
        }, () => {
            socket.addMembership(MULTICAST_ADDRESS);
            console.log('Socket bound to port and added to multicast group');
        });
        const message = Buffer.from('M-SEARCH * HTTP/1.1\r\n' +
            `HOST: ${MULTICAST_ADDRESS}:${MULTICAST_PORT}\r\n` +
            'MAN: "ssdp:discover"\r\n' +
            'ST: roku:ecp\r\n' +
            'MX: 3\r\n' +
            '\r\n');
        socket.send(new Uint8Array(message), 0, message.length, MULTICAST_PORT, MULTICAST_ADDRESS, err => {
            if (err) {
                console.error('Error sending M-SEARCH request:', err);
            }
            else {
                console.log('M-SEARCH request sent');
            }
        });
    });
};
exports.GetRokuAddress = GetRokuAddress;
const CheckRokuAddress = async () => {
    try {
        if (!exports.RokuAddress)
            return false;
        const { data: deviceInfo } = await axios_1.default.get(`${exports.RokuAddress}/query/device-info`);
        await xml2js_1.default.parseStringPromise(deviceInfo, {
            explicitArray: false,
            trim: true,
        });
    }
    catch (error) {
        console.error(error.message);
        return false;
    }
    return true;
};
exports.CheckRokuAddress = CheckRokuAddress;
//# sourceMappingURL=network.js.map