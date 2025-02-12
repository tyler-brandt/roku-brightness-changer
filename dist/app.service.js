"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const keys_1 = require("./network/keys");
const network_1 = require("./network/network");
const xml2js_1 = require("xml2js");
let AppService = class AppService {
    async sendKeySequence(commands) {
        await (0, keys_1.sendKeySequence)(commands);
    }
    async getDeviceInfo() {
        try {
            const { data } = await axios_1.default.get(`${network_1.RokuAddress}query/device-info`);
            const info = await (0, xml2js_1.parseStringPromise)(data, {
                explicitArray: false,
                trim: true,
            });
            return JSON.stringify(info, null, 2);
        }
        catch (error) {
            console.error('Unexpected error fetching device info:', error);
            throw new Error('Failed to fetch device info');
        }
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)()
], AppService);
//# sourceMappingURL=app.service.js.map