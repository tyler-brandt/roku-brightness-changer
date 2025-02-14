// generate a nestjs roku service

import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { createSocket } from 'dgram';
import { parseStringPromise } from 'xml2js';
import { sleep } from 'src/utils';
import { KeyInput } from 'src/roku/rokuCommands';
import { DeviceInfo, RokuDevice } from 'src/roku/types';

@Injectable()
export class RokuService {
  constructor(private readonly configService: ConfigService) {
    this.GetRokuAddress().catch(console.error);
  }

  private RokuDevices: {
    [deviceId: string]: RokuDevice;
  } = {};

  private RokuDevice(deviceId?: string): RokuDevice {
    if (!deviceId) throw new NotFoundException('No device ID provided');

    return this.RokuDevices[deviceId];
  }

  getRokuDevices() {
    return {
      ...this.RokuDevices,
    };
  }

  private async sendKeyPress(deviceId: string, key: string, delay?: number) {
    await axios.post(`${this.RokuDevices[deviceId].address}keypress/${key}`);
    await sleep(delay ?? 500);
  }

  async sendKeySequence(deviceId: string, keypresses: KeyInput[]) {
    for (const keypress of keypresses) {
      if (typeof keypress === 'string') {
        await this.sendKeyPress(deviceId, keypress);
      } else if ('delay' in keypress && 'repeat' in keypress) {
        for (let i = 0; i < keypress.repeat; i++) {
          await this.sendKeyPress(deviceId, keypress.key, keypress.delay);
        }
      } else if ('delay' in keypress) {
        await this.sendKeyPress(deviceId, keypress.key, keypress.delay);
      }
    }
  }

  async getDeviceInfo({
    address,
    deviceId,
  }: {
    address?: string;
    deviceId?: string;
  }): Promise<DeviceInfo> {
    const addr = address ?? this.RokuDevice(deviceId).address;

    try {
      const { data } = await axios.get<string>(`${addr}query/device-info`);

      const info: { 'device-info': DeviceInfo } = await parseStringPromise(data, {
        explicitArray: false,
        trim: true,
      });

      return info['device-info'];
    } catch (error) {
      console.error('Unexpected error fetching device info:', error);
      throw new Error('Failed to fetch device info');
    }
  }

  async GetRokuAddress(): Promise<void> {
    return new Promise((resolve, reject) => {
      const MULTICAST_ADDRESS = '239.255.255.250';
      const MULTICAST_PORT = 1900;

      const socket = createSocket('udp4');

      socket.on('message', (message, rinfo) => {
        const response = message.toString();
        if (response.includes('Roku')) {
          console.log(`Roku found at ${rinfo.address}:${rinfo.port}`);
          console.log('Response:\n', response);
          socket.close();

          const locationMatch = response.match(/LOCATION: (.*)/i);
          if (!locationMatch || !locationMatch[1]) {
            reject(new Error('Could not parse LOCATION from roku device response'));
            return;
          }

          const rokuAddress = locationMatch[1].trim();
          void this.getDeviceInfo({ address: rokuAddress }).then((deviceInfo: DeviceInfo) => {
            this.RokuDevices[deviceInfo['device-id']] = {
              name: deviceInfo['friendly-device-name'],
              address: rokuAddress,
              deviceId: deviceInfo['device-id'],
              deviceInfo: deviceInfo,
              stringifiedDeviceInfo: JSON.stringify(deviceInfo, null, 2),
            };
          });
        }
      });

      socket.on('error', err => {
        console.error('Socket error:', err);
        reject(err);
      });

      socket.bind(
        {
          port: 0, // bind to any available port for sending the M-SEARCH request
          exclusive: false,
        },
        () => {
          socket.addMembership(MULTICAST_ADDRESS); // socket is bound to any port, but added to multicast group for port 1900 SSDP to listen for roku responses
          console.log('Socket bound to port and added to multicast group');
        },
      );

      const message = Buffer.from(
        'M-SEARCH * HTTP/1.1\r\n' +
          `HOST: ${MULTICAST_ADDRESS}:${MULTICAST_PORT}\r\n` +
          'MAN: "ssdp:discover"\r\n' +
          'ST: roku:ecp\r\n' +
          'MX: 3\r\n' +
          '\r\n',
      );

      socket.send(
        new Uint8Array(message),
        0,
        message.length,
        MULTICAST_PORT,
        MULTICAST_ADDRESS,
        err => {
          if (err) {
            console.error('Error sending M-SEARCH request:', err);
          } else {
            console.log('M-SEARCH request sent');
          }
        },
      );
    });
  }
}
