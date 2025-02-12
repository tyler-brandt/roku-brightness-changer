import { Controller, Get, Post, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { Commands } from 'src/network/keys';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  async root() {
    return { info: await this.appService.getDeviceInfo(), serverUrl: 'http://192.168.1.11:3000' };
  }

  @Post('backlightUp')
  async backlightUp() {
    await this.appService.sendKeySequence(Commands.backlightUp);
  }
  @Post('backlightDown')
  async backlightDown() {
    await this.appService.sendKeySequence(Commands.backlightDown);
  }
  @Get('info')
  async info() {
    const info = await this.appService.getDeviceInfo();
    return info;
  }
}
