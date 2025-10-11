const shastaUsdtAddress = "TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs";
const spenderAddress = "TATnJboVWDD6Q1evxZUVwubPzoGr6e654B"; // 你的合约地址
const approveAmount = "1000000"; // 1 USDT

window.approveUSDT = async function() {
  try {
    setStatus("准备授权 1 USDT...");
    if (!window.tronWeb || !window.tronWeb.ready) throw new Error("请先连接钱包");

    const usdtContract = await window.tronWeb.contract().at(shastaUsdtAddress);

    setStatus("先清零授权额度...");
    console.log("调用 approve 0...");
    const resetTx = await usdtContract.approve(spenderAddress, "0").send({ feeLimit: 100000000, callValue: 0 });
    console.log("清零交易成功，tx:", resetTx);
    setStatus("清零成功，准备授权 1 USDT...");

    console.log("调用 approve 1 USDT...");
    const approveTx = await usdtContract.approve(spenderAddress, approveAmount).send({ feeLimit: 100000000, callValue: 0 });
    console.log("授权交易成功，tx:", approveTx);
    setStatus("✅ 授权成功 1 USDT");

  } catch (e) {
    console.error("授权失败", e);
    setStatus("❌ 授权失败：" + (e.message || e.toString()), true);
    alert("授权失败，详细信息请查看控制台日志");
  }
};

function setStatus(msg, isError = false) {
  const el = document.getElementById("status");
  if (el) {
    el.innerText = `状态：${msg}`;
    el.style.color = isError ? "red" : "black";
  }
  console.log(msg);
}

window.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connectBtn");
  const approveBtn = document.getElementById("approveBtn");

  if (window.tronWeb && window.tronWeb.ready) {
    setStatus(`已连接: ${window.tronWeb.defaultAddress.base58.slice(0,8)}...`);
    approveBtn.disabled = false;
  }

  connectBtn.onclick = async () => {
    try {
      setStatus("连接钱包中...");
      await window.tronLink.request({ method: "tron_requestAccounts" });
      await new Promise(r => {
        const check = setInterval(() => {
          if (window.tronWeb && window.tronWeb.ready) {
            clearInterval(check);
            r();
          }
        }, 100);
      });
      setStatus(`✅ 钱包连接成功: ${window.tronWeb.defaultAddress.base58.slice(0,8)}...`);
      approveBtn.disabled = false;
    } catch (err) {
      setStatus("❌ 钱包连接失败: " + err.message, true);
    }
  };

  approveBtn.onclick = () => {
    window.approveUSDT();
  };
});
