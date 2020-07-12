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

/*
 * Filter elements by tag.
 */
function* filterTag(elms) {
  for (elm of elms) {
    if (!IGNORE_TAGS.includes(elm.tagName.toLowerCase())) {
      if (!isChildOf(elm, IGNORE_TAGS)) {
        yield elm;
      }
    }
  }
}

/*
 * Test if a given string valid URL.
 */
function isValidUrl(s) {
  try {
    new URL(s);
  } catch (_) {
    return false;
  }
  return true;
}

const INLINE_ELEMENTS = [
  'a', 'abbr', 'acronym', 'audio', 'b', 'bdi', 'bdo', 'big', 'br',
  'button', 'canvas', 'cite', 'code', 'data', 'datalist', 'del',
  'dfn', 'em', 'embed', 'i', 'iframe', 'img', 'input', 'ins', 'kbd',
  'label', 'map', 'mark', 'meter', 'noscript', 'object', 'output',
  'picture', 'progress', 'q', 'ruby', 's', 'samp', 'script', 'select',
  'slot', 'small', 'span', 'strong', 'sub', 'sup', 'svg', 'template',
  'textarea', 'time', 'u', 'tt', 'var', 'video', 'wbr',
]

/*
 * Test if elm is a child of any of the given tags.
 */
function isChildOf(elm, tags) {
  const parent = elm.parentNode;
  if (parent === undefined) {
    return false;
  }

  const tagName = parent.tagName.toLowerCase();
  if (tags.includes(tagName)) {
    return true;
  }

  // If an element is a child of inline element,
  // Check the grand parent.
  // e.g. <div><span>foo</span>/</div>
  if (INLINE_ELEMENTS.includes(tagName)) {
    return isChildOf(parent, tags);
  }

  return false;
}

function parrotify() {
  const elms = $(document).xpath("//*[text()[contains(.,':parrot:')]]");
  console.debug('Fetched by xpath:', elms);

  for (elm of filterTag(elms)) {
    console.debug('[before] innerText:', elm.innerText, 'innerHTML', elm.innerHTML);
    const tag = elm.tagName.toLowerCase();
    const width = EmojiSize.get(tag);
    console.debug('tagName: ', tag, ', width: ', width);

    newHTML = elm.innerHTML.replace(/:parrot:/g, `<img src="${parrot}" style="width: ${width}px">`);
    elm.innerHTML = newHTML;

    console.debug('[after] innerText:', elm.innerText, 'innerHTML', elm.innerHTML);
  }
}
class State {
  constructor() {
    this.shouldUpdate = false;
    this.lastUpdated = Date.now();
  }
}

$(() => {
  var state = new State();
  parrotify();

  // Start observer to watch DOM changes.
  const observer = new MutationObserver((list, observer) => {
    console.debug('Updated', list);
    state.shouldUpdate = true;
  });
  observer.observe(document, { attribute: false, childList: true, subtree: true, characterData: true });

  // Start timer to parrotify.
  setTimeout(() => {
    const now = Date.now();
    if (state.shouldUpdate) {
      state.shouldUpdate = false;
      state.lastUpdated = Date.now();
      parrotify();
    }
  }, 500);
});
