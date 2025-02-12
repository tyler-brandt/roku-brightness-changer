const serverUrl = 'http://192.168.1.11:3000';

const eventListeners = {
  brightnessUp: async () => {
    console.log('Backlight UP button clicked');
    try {
      const response = await fetch(`${serverUrl}/backlightUp`);
      const data = await response.text();
      console.log(data);
    } catch (error) {
      console.error('Error:', error);
    }
  },
  brightnessDown: async () => {
    console.log('Backlight DOWN button clicked');
    try {
      const response = await fetch(`${serverUrl}/backlightDown`);
      const data = await response.text();
      console.log(data);
    } catch (error) {
      console.error('Error:', error);
    }
  },
  info: async () => {
    console.log('Info button clicked');
    try {
      const response = await fetch(`${serverUrl}/info`);
      const data = await response.text();
      console.log(data);
      document.getElementById('info-display').innerHTML = data;
    } catch (error) {
      console.error('Error:', error);
    }
  },
};

document.getElementById('up').addEventListener('click', eventListeners.brightnessUp);
document.getElementById('down').addEventListener('click', eventListeners.brightnessDown);
document.getElementById('info').addEventListener('click', eventListeners.info);
