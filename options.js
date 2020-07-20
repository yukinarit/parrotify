const page = document.getElementById('textURL');
page.addEventListener("change", () => {
  chrome.storage.sync.set({url: page.value}, () => {
    console.debug('Set URL: ' + page.value);
  });
});