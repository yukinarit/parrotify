console.debug('script.js is running now.');

chrome.storage.sync.get('color', (data) => {
  emojiSizes = {
    h1: 32,
    h2: 24,
  };
  const elms = $(document).xpath("//*[text()[contains(.,':parrot:')]]");
  console.debug('Fetched by xpath:', elms);
  for (elm of elms) {
    // TODO Needs to ignore TextArea.
    console.debug('[before] innerText:', elm.innerText, 'innerHTML', elm.innerHTML);
    const tag = elm.tagName.toLowerCase();
    const width = emojiSizes[tag] || 15;
    console.debug('tagName: ', tag, ', width: ', width);

    newHTML = elm.innerHTML.replace(/:parrot:/g, `<img src="https://cultofthepartyparrot.com/parrots/hd/parrot.gif" style="width: ${width}px">`);
    elm.innerHTML = newHTML;

    console.debug('[after] innerText:', elm.innerText, 'innerHTML', elm.innerHTML);
  }
});
