import { createServer, IncomingMessage, ServerResponse } from 'http';
import axios from 'axios';
import xml2js from 'xml2js';
import { Commands, sendKeySequence } from './keys';
import { CheckRokuAddress, GetRokuAddress, RokuAddress } from './network';
import { readFileSync } from 'fs';

const main = async () => {
  await GetRokuAddress();

  const command = process.argv[2];

  switch (command) {
    case 'down':
      sendKeySequence(Commands.backlightDown);

      break;
    case 'up':
      sendKeySequence(Commands.backlightUp);

      break;
    default: {
      const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
        var isAddressGood = await CheckRokuAddress();
        if (!isAddressGood) {
          await GetRokuAddress();
        }

        // var { sendKeySequence } = useKeySender(address);

        console.log('Received request at URL: ', req.url);
        console.log({ url: req.url });

        if (req.url === '/backlightDown') {
          sendKeySequence(Commands.backlightDown);
        } else if (req.url === '/backlightUp') {
          sendKeySequence(Commands.backlightUp);
        } else if (req.url === '/info') {
          const { data: deviceInfo } = await axios.get(`${RokuAddress}/query/device-info`);
          const info = await xml2js.parseStringPromise(deviceInfo, {
            explicitArray: false,
            trim: true,
          });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.write(JSON.stringify(info, null, 2));
        } else if (req.url === '/') {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.write(readFileSync(`${__dirname}/public/index.html`).toString());
        } else if (req.url === '/index.js') {
          res.writeHead(200, { 'Content-Type': 'application/javascript' });
          res.write(readFileSync(`${__dirname}/public/index.js`).toString());
        } else if (req.url === '/favicon.ico') {
          res.writeHead(200, { 'Content-Type': 'image/x-icon' });
          res.write(readFileSync(`${__dirname}/assets/favicon.png`));
        } else {
          console.log('Unknown command:', req.url);
        }

        res.end();
      });

      // Static LAN IP address assigned to tyler's 2020 MBP at 192.168.1.11
      server.listen(3000, '0.0.0.0', () => {
        console.log('Server running at http://192.168.1.11:3000/');
      });
      break;
    }
  }
};

main();
