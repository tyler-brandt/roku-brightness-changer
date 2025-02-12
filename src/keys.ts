import axios from 'axios';
import { sleep } from './utils';
import { RokuAddress } from './network';

export type KEYS = 'up' | 'down' | 'left' | 'right' | 'info';

export type KeyInput =
  | KEYS
  | { key: KEYS; delay: number }
  | { key: KEYS; delay: number; repeat: number };

// export const useKeySender = (address: string) => {

//   return {
//     sendKeySequence: async (keypresses: KeyInput[]) => {
//       for (const keypress of keypresses) {
//         if (typeof keypress === 'string') {
//           await sendKeyPress(keypress);
//         } else if ('delay' in keypress && 'repeat' in keypress) {
//           for (let i = 0; i < keypress.repeat; i++) {
//             await sendKeyPress(keypress.key, keypress.delay);
//           }
//         } else if ('delay' in keypress) {
//           await sendKeyPress(keypress.key, keypress.delay);
//         }
//       }
//     },
//   };
// };

const sendKeyPress = async (key: string, delay?: number) => {
  await axios.post(`${RokuAddress}keypress/${key}`);
  await sleep(delay ?? 500);
};

export const sendKeySequence = async (keypresses: KeyInput[]) => {
  for (const keypress of keypresses) {
    if (typeof keypress === 'string') {
      await sendKeyPress(keypress);
    } else if ('delay' in keypress && 'repeat' in keypress) {
      for (let i = 0; i < keypress.repeat; i++) {
        await sendKeyPress(keypress.key, keypress.delay);
      }
    } else if ('delay' in keypress) {
      await sendKeyPress(keypress.key, keypress.delay);
    }
  }
};

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
