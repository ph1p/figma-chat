/**
 * An structured way to handle renderer and main messages
 */
class EventEmitter {
  messageEvent = new Map();
  emit: (
    name: string,
    data?:
      | Record<string, unknown>
      | number
      | string
      | Uint8Array
      | unknown[]
      | boolean
  ) => void;

  constructor() {
    // MAIN PROCESS
    try {
      this.emit = (name, data) => {
        figma.ui.postMessage({
          name,
          data: data || null,
        });
      };

      figma.ui.onmessage = (event) => {
        if (this.messageEvent.has(event.name)) {
          this.messageEvent.get(event.name)(event.data, this.emit);
        }
      };
    } catch {
      // we ignore the error, because it only says, that "figma" is undefined
      // RENDERER PROCESS
      onmessage = (event) => {
        if (this.messageEvent.has(event.data.pluginMessage.name)) {
          this.messageEvent.get(event.data.pluginMessage.name)(
            event.data.pluginMessage.data,
            this.emit
          );
        }
      };

      this.emit = (name = '', data = {}) => {
        parent.postMessage(
          {
            pluginMessage: {
              name,
              data: data || null,
            },
          },
          '*'
        );
      };
    }
  }

  /**
   * This method emits a message to main or renderer
   * @param name string
   * @param callback function
   */
  on(name, callback) {
    this.messageEvent.set(name, callback);

    return () => this.remove(name);
  }

  /**
   * Listen to a message once
   * @param name
   * @param callback
   */
  once(name, callback) {
    const remove = this.on(name, (data, emit) => {
      callback(data, emit);
      remove();
    });
  }

  /**
   * Ask for data
   * @param name
   */
  ask(name, data = undefined) {
    this.emit(name, data);

    return new Promise((resolve) => this.once(name, resolve));
  }

  /**
   * Answer data from "ask"
   * @param name
   * @param functionOrValue
   */
  answer(name, functionOrValue) {
    this.on(name, (incomingData, emit) => {
      if (this.isAsyncFunction(functionOrValue)) {
        functionOrValue(incomingData).then((data) => emit(name, data));
      } else if (typeof functionOrValue === 'function') {
        emit(name, functionOrValue(incomingData));
      } else {
        emit(name, functionOrValue);
      }
    });
  }

  /**
   * Remove and active listener
   * @param name
   */
  remove(name) {
    if (this.messageEvent.has(name)) {
      this.messageEvent.delete(name);
    }
  }

  /**
   * This function checks if it is asynchronous or not
   * @param func
   */
  isAsyncFunction(func) {
    func = func.toString().trim();

    return (
      func.match('__awaiter') || func.match('function*') || func.match('async')
    );
  }
}

export default new EventEmitter();
