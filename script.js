/*global chrome*/

const PARROT_URL = 'https://cultofthepartyparrot.com/parrots/hd/parrot.gif';

function logParrot() {
  console.info('%c.', `font-size: 1px; line-height: 70px; padding: 30px 60px; background: url("${PARROT_URL}");`);
}

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
  for (const elm of elms) {
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

class State {
  constructor() {
    this.shouldUpdate = false;
    this.lastUpdated = Date.now();
  }
}

class Parrotify {
  constructor() {
    this.state = new State();
    // Start observer to watch DOM changes.
    this.observer = new MutationObserver((list, observer) => {
      console.debug('Updated', list);
      this.state.shouldUpdate = true;
    });
    this.observer.observe(document, { attribute: false, childList: true, subtree: true, characterData: true });
    // Parrotify task queue. Pop and process one by one during browser idle time.
    this.queue = []

    // Start timer to parrotify.
    setTimeout(() => {
      if (this.state.shouldUpdate) {
        this.state.shouldUpdate = false;
        this.state.lastUpdated = Date.now();
        this.run();
      }
    }, 500);
  }

  /**
   * Start Parrotifying :parrot:.
   */
  run() {
    logParrot();
    this.queue = this.queue.concat(this.load());
    console.debug('Queue updated', this.queue);

    if (this.queue.length > 0) {
      requestIdleCallback(this.runBackground.bind(this));
    }
  }

  /**
   * Run Parrotifying on background using requestIdCallback.
   */
  runBackground(deadline) {
    console.debug('runBackground', this.queue);
    while (deadline.timeRemaining() > 0 && this.queue.length > 0) {
      console.debug(`Processing: queue=${this.queue.length}`);
      this.replaceElement(this.queue.pop());
    }
    if (this.queue.length > 0) {
      requestIdleCallback(this.runBackground.bind(this));
    }
  }

  /**
   * Load elements that may contain Emoji.
   */
  load() {
    const elms = $(document).xpath("//*[text()[contains(.,':')]]");
    console.debug('Fetched by xpath:', elms);

    return Array.from(filterTag(elms));
  }

  /**
   * Replace emoji text to emoji image.
   */
  replaceElement(elm) {
    console.debug('[before] innerText:', elm.innerText, 'innerHTML', elm.innerHTML);
    const tag = elm.tagName.toLowerCase();
    const width = EmojiSize.get(tag);
    console.debug('tagName: ', tag, ', width: ', width);

    const newHTML = elm.innerHTML.replace(/:parrot:/g, `<img src="${PARROT_URL}" style="width: ${width}px">`);
    elm.innerHTML = newHTML;

    console.debug('[after] innerText:', elm.innerText, 'innerHTML', elm.innerHTML);
  }
}

chrome.storage.sync.get('urls', ({urls}) => {
  console.debug('Load URL List from storage:', urls);
  if (!urls || urls.length === 0) {
    return;
  }
  for (const url of urls) {
    console.debug(`Check pattern: ${url}, Current URL: ${location.href}`);
    const re = new RegExp(url);
    if (!re.test(location.href)) {
      console.debug('URL didn\'t match')
      return;
    }
    console.debug('URL matched. Let\'s parrotify! :parrot:')
  }
  const parrot = new Parrotify();
  parrot.run();
});
