/*
const page = document.getElementById('textURL');

// Display url pattern in the storage.
chrome.storage.sync.get('url', (data) => {
  page.value = data.url;
});

// Update url pattern in the storage.
page.addEventListener("change", () => {
  chrome.storage.sync.set({url: page.value}, () => {
    console.debug('Set URL: ' + page.value);
  });
});
*/

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
