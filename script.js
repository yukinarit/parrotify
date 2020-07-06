console.debug('script.js is running now.');

chrome.storage.sync.get('color', (data) => {
  const parrots = $(document).xpath("//*[text()[contains(.,':parrot:')]]");
  console.debug('Fetched by xpath:', parrots);
  for (parrot of parrots) {
    console.debug(`Text: ${parrot.innerText}`)
    const img = document.createElement('img');

    img.src = 'https://cultofthepartyparrot.com/parrots/hd/parrot.gif';
    img.style.width = '15px';
    parrot.innerText = '';
    parrot.appendChild(img);
  }

});
