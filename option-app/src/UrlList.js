/*global chrome*/
import React, { useState, useEffect } from "react";
import "./UrlList.css";

/**
 * UrlList component displays list of URLs to run parrotify.
 */
function UrlList() {
  const [urls, setUrls] = useState([]);
  const [newUrl, setNewUrl] = useState();

  // Load urls from chrome extension storage.
  useEffect(() => {
    chrome.storage.sync.get("urls", ({ urls }) => {
      console.debug("Fetch urls from chrome extension storage:", urls);
      if (!urls) {
        setUrls(urls);
      }
    });
  }, []);

  // Sync updated url list to chrome storage.
  useEffect(() => {
    chrome.storage.sync.set({ urls: urls }, () => {
      console.debug("URL List was updated: ", urls);
    });
  }, [urls]);

  /**
   * An inner component that forms a table of URLs.
   */
  function UrlTable({ urls }) {
    const rows = (urls || []).map((url) => {
      return (
        <tr>
          <td>{url}</td>
          <td>
            <button
              type="button"
              onClick={(e) => {
                console.debug(`Delete button for "${url}" was clicked: `, e);
                setUrls((urls) => {
                  const idx = urls.indexOf(url);
                  if (idx > -1) {
                    console.debug(`"${url}" was removed from the URL List`);
                    urls.splice(idx, 1);
                    return [...urls];
                  } else {
                    return urls;
                  }
                });
              }}
            >
              Delete
            </button>
          </td>
        </tr>
      );
    });

    return <table>{rows}</table>;
  }

  /**
   * Handler called when a new URL is entered.
   * @param {Event} e - Event for input element.
   */
  function onNewURL(e) {
    console.debug(
      `onNewURL: key=${e.key}, event_type=${e.type}, target_value=${e.target.value}`
    );
    if ((e.type === "keyup" && e.keyCode === 13) || e.type === "blur") {
      setNewUrl(e.target.value);
      console.debug(`Option "url" has changed to ${newUrl}`);

      if (!newUrl) {
        console.debug('"url" is undefined, skip saving in storage.');
        return;
      }

      if (urls.includes(newUrl)) {
        console.debug(`A URL "${newUrl}" is already in the list.`);
        return;
      }

      // Update url pattern in the storage.
      setUrls((urls) => [...urls, newUrl]);
    }
  }

  return (
    <div className="UrlList">
      <input type="text" onKeyUp={onNewURL} onBlur={onNewURL} />
      <UrlTable urls={urls} />
    </div>
  );
}

export default UrlList;
