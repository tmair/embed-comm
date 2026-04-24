let postMessageFunction = null;

/**
 * Detects the postMessage function to be used for the different platforms we are using.
 */
function getPostMessageFunction() {
  if (postMessageFunction) {
    return postMessageFunction;
  }

  if (window.embedBridge?.postMessage) {
    // android bridge detected
    /*
     * In Android it is only possible to pass primitive types via the javascript bridge mechanism.
     * Therefore we stringify the objects and it will be deserialized on the Android side.
     *
     * Also, the this context of the postMessage function needs to be preserved. We therefore wrap the
     * function into an anonymous function to preserve the context.
     */
    postMessageFunction = (message) =>
      window.embedBridge?.postMessage(JSON.stringify(message));
  } else if (window.webkit?.messageHandlers?.embedBridge?.postMessage) {
    // iOS bridge detected
    postMessageFunction =
      window.webkit.messageHandlers.embedBridge.postMessage.bind(
        window.webkit.messageHandlers.embedBridge,
      );
  } else {
    // no bridge detected, using default post message functionality for web integration
    postMessageFunction = parent.postMessage.bind(parent);
  }

  return postMessageFunction;
}

const logElement = document.getElementById("log");
const contextIdElement = document.getElementById("contextId");
const visitorIdElement = document.getElementById("visitorId");

function addLog(message, isSend) {
  const logEntry = document.createElement("div");
  logEntry.classList.add("log-entry");
  if (isSend) {
    logEntry.classList.add("sent");
  } else {
    logEntry.classList.add("received");
  }
  logEntry.textContent =
    typeof message === "object" ? JSON.stringify(message) : message;
  logElement.appendChild(logEntry);
}

function sendRequest() {
  const message = {
    type: "request-context-data",
    version: "1.2.0",
    payload: {
      contextId: contextIdElement.checked,
      visitorId: visitorIdElement.checked,
    },
  };

  addLog(message, true);

  getPostMessageFunction()(message);
}

window.hostBridge = {
  sendMessage: (message) => {
    addLog(message);
  },
};
