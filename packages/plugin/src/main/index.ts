import './store';
import { generateString } from '@fc/shared/utils/helpers';

import EventEmitter from '../shared/EventEmitter';

let isMinimized = false;
let isFocused = true;
let sendNotifications = false;
let triggerSelectionEvent = true;

const isRelaunch = figma.command === 'relaunch';
const isReset = figma.command === 'reset';

const currentUser = {
  ...figma.currentUser,
};

delete currentUser.sessionId;

if (isReset) {
} else {
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
    let history = figma.root.getPluginData('history');
    let roomName = figma.root.getPluginData('roomName');
    let secret = figma.root.getPluginData('secret');
    // const ownerId = figma.root.getPluginData('ownerId');

    if (!history) {
      history = '[]';
      figma.root.setPluginData('history', history);
    }

    // Parse History
    try {
      history = typeof history === 'string' ? JSON.parse(history) : [];
    } catch {
      history = JSON.parse('[]');
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

    return {
      roomName,
      secret,
      history,
    };
  };

  const getSelectionIds = () => figma.currentPage.selection.map((n) => n.id);

  const sendSelection = () => {
    EventEmitter.emit('selection', {
      page: {
        id: figma.currentPage.id,
        name: figma.currentPage.name,
      },
      nodes: getSelectionIds(),
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

  EventEmitter.on('remove message', (messageId: string) => {
    const messageHistory = JSON.parse(
      figma.root.getPluginData('history') || '[]'
    );

    figma.root.setPluginData(
      'history',
      JSON.stringify(
        messageHistory.filter((message) =>
          message?.id ? message?.id !== messageId : true
        )
      )
    );
  });

  EventEmitter.on('clear-chat-history', (_, send) => {
    figma.root.setPluginData('history', '[]');

    send('history', JSON.parse('[]'));
  });

  EventEmitter.on('add-message-to-history', (payload) => {
    const messageHistory = JSON.parse(
      figma.root.getPluginData('history') || '[]'
    );

    figma.root.setPluginData(
      'history',
      JSON.stringify(messageHistory.concat(payload))
    );
  });

  EventEmitter.answer(
    'get-history',
    JSON.parse(figma.root.getPluginData('history') || '[]')
  );

  EventEmitter.on('minimize', (flag) => {
    isMinimized = flag;
    sendNotifications = isMinimized;

    // resize window
    figma.ui.resize(flag ? 180 : 333, flag ? 108 : 490);
  });

  EventEmitter.on('notify', (payload) => {
    figma.notify(payload);
  });

  EventEmitter.on('notification', (payload) => {
    if (sendNotifications) {
      figma.notify(payload);
    }
  });

  EventEmitter.answer('current-user', async () => currentUser);

  EventEmitter.answer('root-data', async () => {
    const { roomName, secret, history } = await main();

    return {
      roomName,
      secret,
      history,
      currentUser,
      selection: getSelectionIds(),
    };
  });

  EventEmitter.on('focus', (payload) => {
    if (!isMinimized) {
      isFocused = payload;

      if (!isFocused) {
        sendNotifications = true;
      }
    }
  });

  EventEmitter.on('focus-nodes', (payload) => {
    let selectedNodes = [];
    triggerSelectionEvent = false;

    // fallback for ids
    if (payload.ids) {
      selectedNodes = payload.ids;
    } else {
      goToPage(payload?.page?.id);
      selectedNodes = payload.nodes;
    }

    const nodes = figma.currentPage.findAll(
      (n) => selectedNodes.indexOf(n.id) !== -1
    );

    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);

    setTimeout(() => (triggerSelectionEvent = true));
  });

  EventEmitter.on('ask-for-relaunch-message', (_, emit) => {
    if (isRelaunch && !alreadyAskedForRelaunchMessage) {
      alreadyAskedForRelaunchMessage = true;
      emit('relaunch-message', {
        selection: {
          page: {
            id: figma.currentPage.id,
            name: figma.currentPage.name,
          },
          nodes: getSelectionIds(),
        },
      });
    }
  });

  EventEmitter.on('cancel', () => {});

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
          if (
            node.setRelaunchData &&
            isValidShape(node) &&
            figma.getNodeById(node.id)
          ) {
            node.setRelaunchData({});
          }
        }
      }
    }
    if (triggerSelectionEvent) {
      sendSelection();
    }
  });
}
