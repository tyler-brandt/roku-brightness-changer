import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    root(): Promise<{
        info: string;
        serverUrl: string;
    }>;
    backlightUp(): Promise<void>;
    backlightDown(): Promise<void>;
    info(): Promise<string>;
}
