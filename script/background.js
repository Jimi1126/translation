const setting = {
  client: 'gtx',
  sl: 'auto',
  tl: 'zh-CN',
  dt: 't',
}

chrome.contextMenus.create({
  type: 'normal', // 类型，可选：["normal", "checkbox", "radio", "separator"]，默认 normal
  title: '翻译：%s', // 显示的文字，除非为“separator”类型否则此参数必需，如果类型为“selection”，可以使用%s显示选定的文本
  contexts: ['selection'], // 上下文环境，可选：["all", "page", "frame", "selection", "link", "editable", "image", "video", "audio"]
  onclick: translation, // 单击时触发的方法
  documentUrlPatterns: ['http://*/*', 'https://*/*'] // 只在某些页面显示此右键菜单
});

let ing = false;

function translation (context) {
  if (ing) return;
  ing = true;

  // get setting
  chrome.storage.sync.get({ sl: 'auto', tl: 'zh-CN' }, function (items) {

    Object.assign(setting, items);

    ajax({
      url: "https://translate.google.cn/translate_a/single",
      type: 'post',
      data: Object.assign({ q: context.selectionText }, setting),
      timeout: 30000,
      contentType: "application/json",
      success: function (data) {
        sendMessageToContentScript({ cmd: 'trs', value: data }, () => { ing = false });
      },
      error: function (e) {
        sendMessageToContentScript({ cmd: 'trs', value: e }, () => { ing = false });
      }
    })

  });
}

function sendMessageToContentScript (message, callback = () => { }) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    tabs[0] && chrome.tabs.sendMessage(tabs[0].id, message, callback);
  });
}

chrome.extension.onRequest.addListener(function (msg, sender, sendResponse) {
  const $input = document.createElement('input');
  $input.value = msg.text;
  document.body.appendChild($input);
  // and copy the text from the input
  $input.select();
  document.execCommand("copy", false, null);
  document.body.removeChild($input);
  // finally, cleanup / close the connection
  sendResponse({});
});

function ajax (options) {
  options = options || {};
  options.type = (options.type || "GET").toUpperCase(); // 请求格式GET、POST，默认为GET
  options.dataType = options.dataType || "json"; // 响应数据格式，默认json
  var params = formatParams(options.data);

  var xhr = new XMLHttpRequest();

  //启动并发送一个请求
  if (options.type == "GET") {
    xhr.open("GET", options.url + "?" + params, true);
    xhr.send(null);
  } else if (options.type == "POST") {
    xhr.open("post", options.url, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(params);
  }

  setTimeout(function () {
    if (xhr.readySate != 4) {
      xhr.abort();
    }
  }, options.timeout)

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      var status = xhr.status;
      if (status >= 200 && status < 300 || status == 304) {
        options.success && options.success(JSON.parse(xhr.responseText));
      } else {
        options.error && options.error(status);
      }
    }
  }
}

function formatParams (data) {
  var arr = [];
  for (var name in data) {
    arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
  }
  arr.push(("v=" + Math.random()).replace(".", ""));
  return arr.join("&");

}