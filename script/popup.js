const $ = document.querySelector.bind(document);

chrome.storage.sync.get({ sl: 'auto', tl: 'zh-CN' }, function (items) {
  $(`#sl option[value="${items.sl}"]`).setAttribute('selected', 'selected');
  $(`#tl option[value="${items.tl}"]`).setAttribute('selected', 'selected');
});

$('#sl').addEventListener('change', function (e) {
  const sl = this.options[this.selectedIndex].value;
  chrome.storage.sync.set({ sl });
})

$('#tl').addEventListener('change', function (e) {
  const tl = this.options[this.selectedIndex].value;
  chrome.storage.sync.set({ tl });
})