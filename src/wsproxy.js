// Proxy WebSocket messages to the IQAlert content script.

const OriginalWebsocket = window.WebSocket;
const ProxiedWebSocket = function () {
    const ws = new OriginalWebsocket(...arguments);
    ws.addEventListener("message", function (e) {
        window.postMessage({ type: 'iqalert_ws-receive', msg: e.data });
    });
    return ws;
};
window.WebSocket = ProxiedWebSocket;