import { KeyInput } from 'src/network/keys';
export declare class AppService {
    sendKeySequence(commands: KeyInput[]): Promise<void>;
    getDeviceInfo(): Promise<string>;
}
