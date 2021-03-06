/*global chrome*/
/*global $*/

const PARROT_URL = "https://cultofthepartyparrot.com/parrots/hd/parrot.gif";

function logParrot() {
  console.info(
    "%c.",
    `font-size: 1px; line-height: 70px; padding: 30px 60px; background: url("${PARROT_URL}");`
  );
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
    return EmojiSizes[tag] || EmojiSizes["default_value"];
  }
}

const IGNORE_TAGS = ["textarea", "pre", "code"];

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


function mapObject(obj, func) {
  for (const key of Object.keys(obj)) {
    obj[key] = func(obj[key]);
  }
  return obj;
}

/**
 * Emoji dictionary in sync with LocalStorage.
 *
 * Those keys are used to save Emoji in LocalStorage:
 *
 * "emojis": emoji index object where
 *   * key is emoji name e.g. "parrot"
 *   * value is a emoji filename in the form of "<emoji_name>"
 *
 * "<emoji_name>: contains actual Emoji data
 *
 */
class EmojiDictionary {
  constructor() {
    this.dict = {}
  }

  async load() {
    const emojis = await getLocal("emojis");
    console.info("Load Emoji List from storage:", emojis);

    if (emojis) {
      for (const name of Object.values(emojis)) {
        const emoji = await getLocal(name);
        this.dict[name] = emoji;
      }
    }

    // Load default parrot emoji.
    if (!("parrot" in Object.keys(this.dict))) {
      const parrot = await this.loadDefaultEmoji();
      await this.set(parrot);
      console.debug("Default emoji set", parrot);
    }

    console.info('Loaded', this.dict);
  }

  async get(name) {
    return this.dict[name];
  }

  async set(emoji) {
    this.dict[emoji.name] = emoji;
    const list = mapObject({...this.dict}, v => v.name);
    console.debug(list);
    await setLocal("emojis", list);
    await setLocal(emoji.name, emoji);
  }

  * iter() {
    for (const name of Object.keys(this.dict)) {
      yield this.dict[name];
    }
  }

  /**
   * Load default parrot emoji.
   */
  async loadDefaultEmoji() {
    const res = await fetch(chrome.runtime.getURL("images/parrot.gif"));
    if (res.status !== 200) {
      console.error("Failed to fetch default Parrot emoji", res);
      return;
    }
    const image = await loadImage(await res.blob());
    const parrot = {
      filename: "parrot.gif",
      name: "parrot",
      data: image.data,
    };
    console.debug("Default parrot emoji loaded", parrot);
    return parrot;
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
  "a",
  "abbr",
  "acronym",
  "audio",
  "b",
  "bdi",
  "bdo",
  "big",
  "br",
  "button",
  "canvas",
  "cite",
  "code",
  "data",
  "datalist",
  "del",
  "dfn",
  "em",
  "embed",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "map",
  "mark",
  "meter",
  "noscript",
  "object",
  "output",
  "picture",
  "progress",
  "q",
  "ruby",
  "s",
  "samp",
  "script",
  "select",
  "slot",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "svg",
  "template",
  "textarea",
  "time",
  "u",
  "tt",
  "var",
  "video",
  "wbr",
];

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

/**
 * Load image and return as promise.
 *
 * Code taken from: https://gist.github.com/resistancecanyon/e1dd2d43519810cf75150a8caf4c5fec
 */
function loadImage(file) {
  return new Promise((resolve, _reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      return resolve({
        data: reader.result,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    };
    reader.readAsDataURL(file);
  });
}

class Parrotify {
  constructor(emojis) {
    this.emojis = emojis;
    this.state = new State();
    // Start observer to watch any changes in DOM.
    this.observer = new MutationObserver((list, observer) => {
      console.debug("Updated", list);
      this.state.shouldUpdate = true;
    });
    this.observer.observe(document, {
      attribute: false,
      childList: true,
      subtree: true,
      characterData: true,
    });
    // Parrotify task queue. Pop and process one by one during browser idle time.
    this.queue = [];

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
   * Start Parrotify! :parrot:
   */
  run() {
    logParrot();
    this.queue = this.queue.concat(this.load());
    console.debug("Queue updated", this.queue);

    if (this.queue.length > 0) {
      requestIdleCallback(this.runBackground.bind(this));
    }
  }

  /**
   * Run Parrotify on background using requestIdCallback.
   */
  runBackground(deadline) {
    console.debug("runBackground", this.queue);
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
    console.debug("Fetched by xpath:", elms);

    return Array.from(filterTag(elms));
  }

  /**
   * Replace emoji text to emoji image.
   */
  replaceElement(elm) {
    console.debug(
      "[before] innerText:",
      elm.innerText,
      "innerHTML",
      elm.innerHTML
    );
    const tag = elm.tagName.toLowerCase();
    const width = EmojiSize.get(tag);
    console.debug("tagName:", tag);
    console.debug("width ", width);

    for (const m of elm.innerHTML.matchAll(/:\w+:/g)) {
      console.debug("Matched", m);
      for (const w of m) {
        console.debug("Matched word", w);
        for (const emoji of this.emojis.iter()) {
          console.debug("Iterate emoji", emoji);
          if (`:${emoji.name}:` === w) {
            const newHTML = elm.innerHTML.replace(
              w,
              `<img src="${emoji.data}" style="width: ${width}px">`
            );
            elm.innerHTML = newHTML;
          }
        }
      }
    }

    console.debug(
      "[after] innerText:",
      elm.innerText,
      "innerHTML",
      elm.innerHTML
    );
  }
}

function getLocal(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (value) => {
      console.debug("GET STORAGE:", key, value[key]);
      return resolve(value[key]);
    });
  });
}

function setLocal(key, value) {
  return new Promise((resolve) => {
    const data = {};
    data[key] = value;
    chrome.storage.local.set(data, () => {
      console.debug("SET STORAGE:", key, value);
      return resolve();
    });
  });
}

async function main() {
  let urls = await getLocal("urls");
  console.info("Load URL List from storage:", urls);
  const emojis = new EmojiDictionary();
  await emojis.load();

  if (!urls) {
    urls = ["github.com"];
    chrome.storage.local.set({ urls: urls });
  }

  if (!urls || urls.length === 0) {
    return;
  }
  const matched = urls.some((url) => {
    console.debug(
      `Check pattern: ${url}, Current URL: ${window.location.href}`
    );
    const re = new RegExp(url);
    return re.test(window.location.href);
  });
  if (!matched) {
    console.debug("URL didn't match");
    return;
  }

  console.debug("URL matched. Let's parrotify! :parrot:");
  const parrotify = new Parrotify(emojis);
  parrotify.run();
}

main();
