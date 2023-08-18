import { createSocket } from 'dgram';
import axios from 'axios';

const sendSearchRequest = async () => {
  return new Promise((resolve, reject) => {
    const MULTICAST_ADDRESS = '239.255.255.250';
    const MULTICAST_PORT = 1900;

    const socket = createSocket('udp4');

    const socketTimeout = setTimeout(() => {
      socket.close();
      console.log('Stopped listening for Roku devices');
    }, 10000);

    socket.on('message', (message, rinfo) => {
      const response = message.toString();
      if (response.includes('Roku')) {
        console.log(`Roku found at ${rinfo.address}:${rinfo.port}`);
        console.log('Response:\n', response);
        socket.close();
        clearTimeout(socketTimeout);

        const locationMatch = response.match(/LOCATION: (.*)/i);
        if (!locationMatch || !locationMatch[1])
          reject('Could not parse LOCATION from roku device response');

        resolve(locationMatch[1].trim());
      }
    });

    socket.on('error', err => {
      console.error('Socket error:', err);
      reject(err);
    });

    socket.on('listening', () => {
      socket.addMembership(MULTICAST_ADDRESS);
      console.log('Socket is listening');
    });

    socket.bind(MULTICAST_PORT);

    const message = Buffer.from(
      'M-SEARCH * HTTP/1.1\r\n' +
        `HOST: ${MULTICAST_ADDRESS}:${MULTICAST_PORT}\r\n` +
        'MAN: "ssdp:discover"\r\n' +
        'ST: roku:ecp\r\n' +
        'MX: 3\r\n' +
        '\r\n',
    );

    socket.send(message, 0, message.length, MULTICAST_PORT, MULTICAST_ADDRESS, err => {
      if (err) {
        console.error('Error sending M-SEARCH request:', err);
      } else {
        console.log('M-SEARCH request sent');
      }
    });
  });
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const main = async () => {
  const address = await sendSearchRequest();

  console.log({ address });

  const { data: deviceInfo } = await axios.get(`${address}/query/device-info`);
  console.log({ deviceInfo });

  const keypress = async (key: string, delay?: number) => {
    await axios.post(`${address}keypress/${key}`);
    await sleep(delay ?? 500);
  };
  const info = async (delay?: number) => await keypress('info', delay);
  const up = async (delay?: number) => await keypress('up', delay);
  const down = async (delay?: number) => await keypress('down', delay);
  const left = async (delay?: number) => await keypress('left', delay);
  const right = async (delay?: number) => await keypress('right', delay);

  const backlightDown = async () => {
    await info();
    await down();
    await right();
    await down();
    await down();
    await right();
    await down();
    await down();
    await right();
    for (let i = 0; i < 100; i++) await left(5);
    await info();
  };

  const backlightUp = async () => {
    await info();
    await down();
    await right();
    await down();
    await down();
    await right();
    await down();
    await down();
    await right();
    for (let i = 0; i < 65; i++) await right(5);
    await info();
  };

  const command = process.argv[2] ?? 'down';

  switch (command) {
    case 'down':
      await backlightDown();
      break;
    case 'up':
      await backlightUp();
      break;
    default:
      await backlightDown();
      break;
  }
};

main();
