let $shade, $container, $tip, $copy;

// assemble tip
function createTip (text) {
  if ($shade) destroy();
  // tip
  $tip = document.createElement('div');
  $tip.style = `position: relative;background: #fff;padding: 16px 32px;font-family: unset;font-size: 16px;font-weight: unset;color: #111;cursor: pointer;max-width: 20vw; max-height: 10vh; overflow: auto;`;
  $tip.addEventListener('click', e => e.stopPropagation());
  $tip.innerText = text;
  // copy
  $copy = document.createElement('div');
  $copy.style = `position: absolute;left: 0px;top: 0px;`;
  $copy.setAttribute('title', '复制');
  $copy.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 100 100"><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="90">📄</text></svg>`;
  $copy.addEventListener('click', function () {
    chrome.extension.sendRequest({ cmd: 'copy', text }, destroy);
  });
  // container
  $container = document.createElement('div');
  $container.style = `position: absolute;left: 0px; top: 10vh; width: 100vw; display: flex;justify-content: center; align-items: center;z-index: 9999;`;
  // shade
  $shade = document.createElement('div');
  $shade.style = `background: rgb(205,205,205,0.1);position: fixed; left: 0px; top: 0px; width: 100vw;height: 100vh;z-index: 9998;`;
  $shade.addEventListener('click', destroy);
  // mount
  $tip.appendChild($copy);
  $container.appendChild($tip);
  $shade.appendChild($container);
  document.body.appendChild($shade);
}

function destroy () {
  document.body.removeChild($shade);
  // release el
  $shade = null;
  $container = null;
  $tip = null;
  $copy = null;
}

// listener background.js message
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.cmd == 'trs') { // translation
    const res = req.value[0];
    res.unshift('');
    createTip(res.reduce((prev, cur) => prev + cur[0]));
  }
  sendResponse();
})