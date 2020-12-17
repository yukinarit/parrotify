/*global chrome*/
import React, { useState, useEffect } from "react";
import "./App.css";
import UrlList from "./UrlList";
import EmojiList from "./EmojiList";

function App() {
  return (
    <div className="App">
      <UrlList />
      <EmojiList />
    </div>
  );
}

export default App;
