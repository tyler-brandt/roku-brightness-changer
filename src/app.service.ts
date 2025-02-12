import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { sendKeySequence, KeyInput } from 'src/network/keys';
import { RokuAddress } from 'src/network/network';
import { DeviceInfo } from 'src/network/types';
import { parseStringPromise } from 'xml2js';

@Injectable()
export class AppService {
  async sendKeySequence(commands: KeyInput[]): Promise<void> {
    await sendKeySequence(commands);
  }

  async getDeviceInfo(): Promise<string> {
    try {
      const { data } = await axios.get<string>(`${RokuAddress}query/device-info`);

      const info: { deviceInfo: DeviceInfo } = await parseStringPromise(data, {
        explicitArray: false,
        trim: true,
      });

      return JSON.stringify(info, null, 2);
    } catch (error) {
      console.error('Unexpected error fetching device info:', error);
      throw new Error('Failed to fetch device info');
    }
  }
}
