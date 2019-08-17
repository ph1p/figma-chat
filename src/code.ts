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
  figma.ui.postMessage({
    type: 'main-ready'
  });

  figma.ui.onmessage = async message => {
    if (message.action === 'save-settings') {
      await figma.clientStorage.setAsync('settings', message.options);

      figma.ui.postMessage({
        type: 'settings',
        settings: message.options
      });
    }

    if (message.action === 'get-settings') {
      const settings = await figma.clientStorage.getAsync('settings');
      figma.ui.postMessage({
        type: 'settings',
        settings
      });
    }

    if (message.action === 'message') {
      throw 'Neue Nachricht!';
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
