async function connectWallet() {
  const statusEl = document.getElementById("walletStatus");
  if (window.tronLink && window.tronLink.tronWeb) {
    try {
      await window.tronLink.request({ method: 'tron_requestAccounts' });
      const address = window.tronLink.tronWeb.defaultAddress.base58;
      statusEl.innerText = "已连接：" + address;
      console.log("连接成功，地址为：", address);
    } catch (err) {
      statusEl.innerText = "连接失败：" + err.message;
    }
  } else {
    statusEl.innerText = "未检测到 TronLink，请安装插件。";
    window.open("https://www.tronlink.org/", "_blank");
  }
}

document.getElementById("connectBtn").addEventListener("click", connectWallet);
