import { DEFAULT_SERVER_URL } from '@shared/utils/constants';

import { generateString } from './shared/utils';

let isMinimized = false;
let isFocused = true;
let sendNotifications = false;
let triggerSelectionEvent = true;

const isRelaunch = figma.command === 'relaunch';

figma.showUI(__html__, {
  width: 333,
  height: 490,
  // visible: !isRelaunch
});

figma.root.setRelaunchData({
  open: '',
});

const main = async () => {
  const timestamp = +new Date();

  // random user id for current user
  let instanceId = await figma.clientStorage.getAsync('id');
  // figma.root.setPluginData('history', '');
  let history = figma.root.getPluginData('history');
  let roomName = figma.root.getPluginData('roomName');
  let secret = figma.root.getPluginData('secret');
  // const ownerId = figma.root.getPluginData('ownerId');

  const settings = await figma.clientStorage.getAsync('user-settings');

  if (!settings || !settings.url) {
    await figma.clientStorage.setAsync('user-settings', {
      ...settings,
      url: DEFAULT_SERVER_URL,
    });
  }

  try {
    JSON.parse(history);
  } catch {
    history = '';
  }

  if (!instanceId) {
    instanceId = 'user-' + timestamp + '-' + generateString(15);
    await figma.clientStorage.setAsync('id', instanceId);
  }

  if (!roomName && !secret) {
    figma.root.setPluginData('ownerId', instanceId);
  }

  if (!roomName) {
    const randomRoomName = timestamp + '-' + generateString(15);
    figma.root.setPluginData('roomName', randomRoomName);
    roomName = randomRoomName;
  }

  if (!secret) {
    secret = generateString(20);
    figma.root.setPluginData('secret', secret);
  }

  if (!history) {
    history = '[]';
    figma.root.setPluginData('history', history);
  }

  // Parse History
  try {
    history = typeof history === 'string' ? JSON.parse(history) : [];
  } catch {}

  return {
    roomName,
    secret,
    history,
    instanceId,
    settings,
  };
};

const postMessage = (type = '', payload = {}) =>
  figma.ui.postMessage({
    type,
    payload,
  });

const getSelectionIds = () => {
  return figma.currentPage.selection.map((n) => n.id);
};

const sendSelection = () => {
  postMessage('selection', {
    page: {
      id: figma.currentPage.id,
      name: figma.currentPage.name,
    },
    nodes: getSelectionIds(),
  });
};

const sendRootData = async ({ roomName, secret, history, instanceId }) => {
  const settings = await figma.clientStorage.getAsync('user-settings');

  postMessage('root-data', {
    roomName,
    secret,
    history,
    instanceId,
    settings,
    selection: getSelectionIds(),
  });
};

let alreadyAskedForRelaunchMessage = false;

const isValidShape = (node) =>
  node.type === 'RECTANGLE' ||
  node.type === 'ELLIPSE' ||
  node.type === 'GROUP' ||
  node.type === 'TEXT' ||
  node.type === 'VECTOR' ||
  node.type === 'FRAME' ||
  node.type === 'COMPONENT' ||
  node.type === 'INSTANCE' ||
  node.type === 'POLYGON';

const goToPage = (id) => {
  if (figma.getNodeById(id)) {
    figma.currentPage = figma.getNodeById(id) as PageNode;
  }
};

let previousSelection = figma.currentPage.selection || [];

main().then(({ roomName, secret, history, instanceId }) => {
  postMessage('ready');

  // events
  figma.on('selectionchange', () => {
    if (figma.currentPage.selection.length > 0) {
      for (const node of figma.currentPage.selection) {
        if (node.setRelaunchData && isValidShape(node)) {
          node.setRelaunchData({
            relaunch: '',
          });
        }
      }
      previousSelection = figma.currentPage.selection;
    } else {
      if (previousSelection.length > 0) {
        // tidy up 🧹
        for (const node of previousSelection) {
          if (node.setRelaunchData && isValidShape(node)) {
            node.setRelaunchData({});
          }
        }
      }
    }
    if (triggerSelectionEvent) {
      sendSelection();
    }
  });

  figma.ui.onmessage = async (message) => {
    switch (message.action) {
      case 'save-user-settings':
        await figma.clientStorage.setAsync('user-settings', message.payload);
        const settings = await figma.clientStorage.getAsync('user-settings');

        postMessage('user-settings', settings);
        break;
      case 'add-message-to-history':
        {
          const messageHistory = JSON.parse(
            figma.root.getPluginData('history')
          );

          figma.root.setPluginData(
            'history',
            JSON.stringify(messageHistory.concat(message.payload))
          );
        }
        break;
      case 'get-history':
        {
          postMessage(
            'history',
            JSON.parse(figma.root.getPluginData('history'))
          );
        }
        break;
      case 'notify':
        figma.notify(message.payload);
        break;
      case 'notification':
        if (sendNotifications) {
          figma.notify(message.payload);
        }
        break;
      case 'initialize':
        postMessage('initialize');

        sendRootData({ roomName, secret, history, instanceId });
        break;
      case 'get-selection':
        sendSelection();
        break;
      case 'clear-chat-history':
        figma.root.setPluginData('history', '[]');

        postMessage('history', JSON.parse('[]'));
        break;
      case 'minimize':
        isMinimized = message.payload;
        sendNotifications = isMinimized;

        // resize window
        figma.ui.resize(
          message.payload ? 180 : 333,
          message.payload ? 108 : 490
        );
        break;
      case 'focus':
        if (!isMinimized) {
          isFocused = message.payload;

          if (!isFocused) {
            sendNotifications = true;
          }
        }
        break;
      case 'focus-nodes':
        let selectedNodes = [];
        triggerSelectionEvent = false;

        // fallback for ids
        if (message.payload.ids) {
          selectedNodes = message.payload.ids;
        } else {
          goToPage(message.payload?.page?.id);
          selectedNodes = message.payload.nodes;
        }

        const nodes = figma.currentPage.findAll(
          (n) => selectedNodes.indexOf(n.id) !== -1
        );

        figma.currentPage.selection = nodes;
        figma.viewport.scrollAndZoomIntoView(nodes);

        setTimeout(() => (triggerSelectionEvent = true));

        break;
      case 'get-root-data':
        sendRootData({ roomName, secret, history, instanceId });
        break;

      case 'ask-for-relaunch-message':
        if (isRelaunch && !alreadyAskedForRelaunchMessage) {
          alreadyAskedForRelaunchMessage = true;
          postMessage('relaunch-message', {
            selection: {
              page: {
                id: figma.currentPage.id,
                name: figma.currentPage.name,
              },
              nodes: getSelectionIds(),
            },
          });
        }
        break;
      case 'cancel':
        figma.closePlugin();
        break;
    }
  };
});
