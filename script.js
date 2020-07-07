console.debug('script.js is running now.');

chrome.storage.sync.get('color', (data) => {
  const parrots = $(document).xpath("//*[text()[contains(.,':parrot:')]]");
  console.debug('Fetched by xpath:', parrots);
  for (elm of parrots) {
    // TODO Needs to ignore TextArea.
    console.debug('[before] innerText:', elm.innerText, 'innerHTML', elm.innerHTML);

    newHTML = elm.innerHTML.replace(/:parrot:/g, '<img src="https://cultofthepartyparrot.com/parrots/hd/parrot.gif" style="width: 15px">');
    elm.innerHTML = newHTML;

    console.debug('[after] innerText:', elm.innerText, 'innerHTML', elm.innerHTML);
    /*
    const img = document.createElement('img');

    img.src = 'https://cultofthepartyparrot.com/parrots/hd/parrot.gif';
    img.style.width = '15px';
    elm.innerText = '';
    elm.appendChild(img);
    */
  }

});
