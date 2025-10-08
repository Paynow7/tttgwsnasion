const usdtAddress = '0xa614f803B6FD780986A42c78Ec9c7f77e6DeD13C'; // Shasta 测试网 USDT
const spenderAddress = 'TYourContractAddressHere'; // 替换成你的合约地址（Base58）

const usdtABI = [
  {
    "constant": false,
    "inputs": [
      { "name": "_spender", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "type": "function"
  }
];

async function approveUSDT() {
  const status = document.getElementById('status');

  if (!window.tronWeb || !window.tronWeb.ready) {
    status.innerText = "❌ 请先安装并登录 TronLink 钱包。";
    return;
  }

  const userAddress = window.tronWeb.defaultAddress.base58;

  try {
    const contract = await window.tronWeb.contract(usdtABI, usdtAddress);
    
    // 授权金额为 1 USDT（6位小数）
    const amountToApprove = 1_000_000;

    const tx = await contract.approve(spenderAddress, amountToApprove).send();
    
    console.log('授权成功:', tx);
    status.innerHTML = `✅ 授权成功！交易哈希：<a href="https://shasta.tronscan.org/#/transaction/${tx}" target="_blank">${tx}</a>`;
  } catch (err) {
    console.error('授权失败:', err);
    status.innerText = "❌ 授权失败：" + err.message;
  }
}
