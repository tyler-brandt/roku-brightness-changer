import { createServer, IncomingMessage, ServerResponse } from 'http';
import axios from 'axios';
import xml2js from 'xml2js';
import { Commands, useKeySender } from './keys';
import { CheckRokuAddress, GetRokuAddress } from './network';

const main = async () => {
  let address = await GetRokuAddress();

  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    var isAddressGood = await CheckRokuAddress(address);
    if (!isAddressGood) {
      address = await GetRokuAddress();
    }

    var { sendKeySequence } = useKeySender(address);

    if (req.url === '/backlightDown') {
      sendKeySequence(Commands.backlightDown);
    } else if (req.url === '/backlightUp') {
      sendKeySequence(Commands.backlightUp);
    } else if (req.url === '/info') {
      const { data: deviceInfo } = await axios.get(`${address}/query/device-info`);
      const info = await xml2js.parseStringPromise(deviceInfo, {
        explicitArray: false,
        trim: true,
      });
      console.log({ info });
    } else {
      console.log('Unknown command:', req.url);
    }

    res.end();
  });

  // Static LAN IP address assigned to tyler's 2020 MBP at 192.168.1.11
  server.listen(3001, '0.0.0.0', () => {
    console.log('Server running at http://192.168.1.11:3001/');
  });
};

main();
