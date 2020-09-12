function sendObjectToDevTools(message) {
  // The callback here can be used to execute something on receipt
  chrome.extension.sendMessage(message, function (message) {});
}

function setSelectedElement(el) {
  sendObjectToDevTools({
    action: "SET_SELECTED_ELEMENT",
    content: el.classList.value,
  });
}
