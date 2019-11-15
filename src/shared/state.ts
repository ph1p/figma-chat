import { store, view } from 'react-easy-state';
import { DEFAULT_SERVER_URL } from '../utils';

const state = store({
  user: {
    name: ''
  },
  messages: [],
  addMessage() {},
  online: 0,
  settings: {
    name: '',
    color: ''
  },
  url: DEFAULT_SERVER_URL
});

export { state, view };
