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

/**
 * Create an Emoji name from filename.
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
  const [emojis, setEmojis] = useState([]);

  // Load emojis from chrome extension storage.
  useEffect(() => {
    chrome.storage.sync.get("emojis", ({ emojis }) => {
      console.debug("Fetch emojis from chrome extension storage:", emojis);
      if (emojis) {
        setEmojis(emojis);
      }
    });
  }, []);

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
            <img src={emoji.data} alt={emoji.name} />
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
