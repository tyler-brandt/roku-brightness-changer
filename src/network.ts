import axios from 'axios';
import { createSocket } from 'dgram';
import xml2js from 'xml2js';

export let RokuAddress: string;

export const GetRokuAddress = async (): Promise<string> => {
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

        RokuAddress = locationMatch[1].trim();
        resolve(locationMatch[1].trim());
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
};

export const CheckRokuAddress = async (): Promise<boolean> => {
  try {
    if (!RokuAddress) return false;

    const { data: deviceInfo } = await axios.get(`${RokuAddress}/query/device-info`);
    const info = await xml2js.parseStringPromise(deviceInfo, {
      explicitArray: false,
      trim: true,
    });
    // console.log({ info });
  } catch (error) {
    return false;
  }
  return true;
};
