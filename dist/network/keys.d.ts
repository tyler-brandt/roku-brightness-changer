export type KEYS = 'up' | 'down' | 'left' | 'right' | 'info';
export type KeyInput = KEYS | {
    key: KEYS;
    delay: number;
} | {
    key: KEYS;
    delay: number;
    repeat: number;
};
export declare const sendKeySequence: (keypresses: KeyInput[]) => Promise<void>;
export declare const Commands: {
    backlightDown: KeyInput[];
    backlightUp: KeyInput[];
    [key: string]: KeyInput[];
};
