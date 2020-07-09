const parrot = 'https://cultofthepartyparrot.com/parrots/hd/parrot.gif';
console.info('%c.', `font-size: 1px; line-height: 70px; padding: 30px 60px; background: url("${parrot}");`);

const EmojiSizes = {
    h1: 32,
    h2: 24,
    h3: 20,
    default_value: 15,
};

/*
 * Return optimal emoji sizes for a given tag.
 */
class EmojiSize {
  static get(tag) {
    return EmojiSizes[tag] || EmojiSizes['default_value'];
  }
}

const IGNORE_TAGS = [
  'textarea', 'pre', 'code',
];

function* filter_tag(elms) {
  for (elm of elms) {
    if (!IGNORE_TAGS.includes(elm.tagName.toLowerCase())) {
      yield elm;
    }
  }
}

$(() => {
  const elms = $(document).xpath("//*[text()[contains(.,':parrot:')]]");
  console.debug('Fetched by xpath:', elms);

  for (elm of filter_tag(elms)) {
    console.debug('[before] innerText:', elm.innerText, 'innerHTML', elm.innerHTML);
    const tag = elm.tagName.toLowerCase();
    const width = EmojiSize.get(tag);
    console.debug('tagName: ', tag, ', width: ', width);

    newHTML = elm.innerHTML.replace(/:parrot:/g, `<img src="${parrot}" style="width: ${width}px">`);
    elm.innerHTML = newHTML;

    console.debug('[after] innerText:', elm.innerText, 'innerHTML', elm.innerHTML);
  }
});
