/*global chrome*/
import React, { useState, useEffect } from "react";
import "./EmojiList.css";

/**
 * Emoji data.
 */
class Emoji {
  constructor(filename, file) {
    this.filename = filename;
    this.name = createEmojiName(filename);
    this.data = file.data;
    this.url = null;
  }

  static from_file(file) {
    return new Emoji(file.name, file);
  }
}

/**
 * Create an Emoji name from filename.
 * @param {str} filename.
 */
function createEmojiName(filename) {
  return filename.split(".").slice(0, -1).join(".");
}

/**
 * Load images.
 */
async function loadImages(e) {
  const files = [...e.target.files];
  return await Promise.all(
    files.map((f) => {
      return loadImage(f);
    })
  );
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

function mapObject(obj, func) {
  for (const key of Object.keys(obj)) {
    obj[key] = func(obj[key]);
  }
  return obj;
}

/**
 * EmojiList component displays list of emojis.
 */
function EmojiList() {
  const [emojis, setEmojis] = useState([]);

  // Load emojis from chrome extension storage.
  useEffect(() => {
    async function get() {
      const emojis = [];
      const list = await getLocal("emojis");
      for (const filename of Object.values(list)) {
        const data = await getLocal(filename);
        const emoji = new Emoji(data.filename, data);
        emojis.push(emoji);
        console.info("Fetching emojis from chrome extension storage:", emoji);
      }
      setEmojis(emojis);
    }
    get();
  }, []);

  // Sync updated emoji list to chrome storage.
  useEffect(() => {
    async function set() {
      // Save Emoji list.
      if (emojis) {
        const list = mapObject({...emojis}, e => e.name);
        await setLocal("emojis", list);

        // Save Emoji data.
        for (const emoji of emojis) {
          await setLocal(emoji.name, emoji);
        }
        console.debug("Emoji List was updated: ", emojis);
      }
    }
    set();
  }, [emojis]);

  /**
   * An inner component that forms a table of Emojis.
   */
  function EmojiTable({ emojis }) {
    console.debug("Displaying emoji list: ", emojis);
    const rows = (emojis || []).map((emoji) => {
      return (
        <tr>
          <td>{emoji.filename}</td>
          <td>:{emoji.name}:</td>
          <td>
            <img
              src={emoji.data}
              alt={emoji.name}
              style={{ maxWidth: "30px", maxHeight: "auto" }}
            />
          </td>
        </tr>
      );
    });
    return <table>{rows}</table>;
  }

  return (
    <div>
      <input
        type="file"
        className="emojiUpload"
        multiple
        onChange={async (e) => {
          const images = await loadImages(e);
          console.debug("New emoji uploaded:", emojis, images);
          setEmojis((emojis) => [...emojis, ...images.map(Emoji.from_file)]);
        }}
      />
      <EmojiTable emojis={emojis} />
    </div>
  );
}

export default EmojiList;
