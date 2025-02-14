import { Controller, Get, Post, Query, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { Commands } from 'src/roku/rokuCommands';
import { RokuService } from 'src/roku/roku.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly rokuService: RokuService,
  ) {}

  @Get()
  @Render('index')
  root() {
    return {
      serverUrl: 'http://192.168.1.11:3000',
      devices: Object.values(this.rokuService.getRokuDevices()),
    };
  }

  @Post('backlightUp')
  async backlightUp(@Query('deviceId') deviceId: string) {
    await this.rokuService.sendKeySequence(deviceId, Commands.backlightUp);
  }
  @Post('backlightDown')
  async backlightDown(@Query('deviceId') deviceId: string) {
    await this.rokuService.sendKeySequence(deviceId, Commands.backlightDown);
  }
  @Get('info')
  async info(@Query('deviceId') deviceId: string) {
    const info = await this.rokuService.getDeviceInfo({ deviceId });
    return JSON.stringify(info, null, 2);
  }
}
