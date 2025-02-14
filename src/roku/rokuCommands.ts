export type KEYS = 'up' | 'down' | 'left' | 'right' | 'info';

export type KeyInput =
  | KEYS
  | { key: KEYS; delay: number }
  | { key: KEYS; delay: number; repeat: number };

export const Commands: {
  backlightDown: KeyInput[];
  backlightUp: KeyInput[];
  [key: string]: KeyInput[];
} = {
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
