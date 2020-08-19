/*global chrome*/
import React, { useState, useEffect } from "react";
import "./EmojiList.css";

/**
 * Emoji.
 */
class Emoji {
  constructor(filename, data) {
    this.filename = filename;
    this.name = createEmojiName(filename);
    this.data = data;
  }

  static from_file(file) {
    return new Emoji(file.name, file.data);
  }
}

let EMOJI_PARROT = new Emoji("parrot.gift", "");

fetch(chrome.runtime.getURL("./images/parrot.gif"))
  .then(res => {
    if (res.status !== 200) {
      console.error("Failed to fetch default Parrot emoji", res);
      return;
    }
    const image = loadImage(res.blob());
    console.debug("Default emoji loaded", image);
    const emoji = Emoji.from_file(image);
    EMOJI_PARROT.data = emoji.data;
});

//const EMOJI_PARROT = new Emoji("parrot.gif");

/**
 * Create an Emoji name from filename.
 * @param {str} filename.
 */
function createEmojiName(filename) {
  const name = filename.split(".").slice(0, -1).join(".");
  return `:${name}:`;
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

/**
 * EmojiList component displays list of emojis.
 */
function EmojiList() {
  const [emojis, setEmojis] = useState([EMOJI_PARROT]);

  // Load emojis from chrome extension storage.
  useEffect(() => {
    chrome.storage.local.get("emojis", ({ emojis }) => {
      console.debug("Fetch emojis from chrome extension storage:", emojis);
      setEmojis(emojis);
    });
  }, []);

  // Sync updated emoji list to chrome storage.
  useEffect(() => {
    chrome.storage.local.set({ emojis: emojis }, () => {
      console.debug("Emoji List was updated: ", emojis);
    });
  }, [emojis]);

  /**
   * An inner component that forms a table of Emojis.
   */
  function EmojiTable({ emojis }) {
    const rows = (emojis || []).map((emoji) => {
      return (
        <tr>
          <td>{emoji.filename}</td>
          <td>{emoji.name}</td>
          <td>
            <img src={emoji.data} alt={emoji.name} style={{maxWidth: "30px", maxHeight: "auto"}} />
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
