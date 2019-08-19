import uniqid from 'uniqid';

const possible =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const generateString = (length = 40) => {
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

figma.showUI(__html__, {
  width: 300,
  height: 410
});

async function main() {
  let roomName = figma.root.getPluginData('roomName');
  let secret = figma.root.getPluginData('secret');

  if (!roomName) {
    let randomRoomName = uniqid() + '-' + generateString(15);
    figma.root.setPluginData('roomName', randomRoomName);
    roomName = randomRoomName;
  }

  if (!secret) {
    secret = generateString(20);
    figma.root.setPluginData('secret', secret);
  }

  return {
    roomName,
    secret
  };
}

main().then(({ roomName, secret }) => {
  figma.ui.onmessage = async message => {
    if (message.action === 'save-user-settings') {
      await figma.clientStorage.setAsync('user-settings', message.options);

      figma.ui.postMessage({
        type: 'user-settings',
        settings: message.options
      });
    }

    if (message.action === 'get-user-settings') {
      const settings = await figma.clientStorage.getAsync('user-settings');
      figma.ui.postMessage({
        type: 'user-settings',
        settings
      });
    }

    if (message.action === 'set-server-url') {
      await figma.clientStorage.setAsync('server-url', message.options);

      alert('Please restart the plugin to connect to the new server.');
      figma.closePlugin();
    }

    if (message.action === 'initialize') {
      const url = await figma.clientStorage.getAsync('server-url');

      figma.ui.postMessage({
        type: 'initialize',
        url: url || ''
      });
    }

    if (message.action === 'get-selection') {
      figma.ui.postMessage({
        type: 'selection',
        selection: figma.currentPage.selection.map(n => n.id)
      });
    }

    if (message.action === 'focus-nodes') {
      const nodes = figma.currentPage.findAll(
        n => message.options.ids.indexOf(n.id) !== -1
      );

      figma.viewport.scrollAndZoomIntoView(nodes);
    }

    if (message.action === 'get-root-data') {
      figma.ui.postMessage({
        type: 'root-data',
        roomName,
        secret
      });
    }

    if (message.action === 'cancel') {
      figma.closePlugin();
    }
  };
});
