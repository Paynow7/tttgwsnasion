// 测试 TRON 链上的不同"大额"方案
const tronTestAmounts = {
  // 方案1: 1万亿 USDT
  oneTrillion: (1000000000000 * 1e6).toString(),
  
  // 方案2: 1000亿 USDT  
  hundredBillion: (100000000000 * 1e6).toString(),
  
  // 方案3: 最大安全数字
  maxSafe: (Number.MAX_SAFE_INTEGER).toString(),
  
  // 方案4: 字符串大数
  stringHuge: "999999999999999999999999"
};

// 让用户选择测试哪种
function testTronAmounts() {
  const choice = prompt(
    "选择 TRON 链测试金额:\n" +
    "1. 1万亿 USDT\n" +
    "2. 1000亿 USDT\n" + 
    "3. JavaScript 最大安全整数\n" +
    "4. 字符串大数",
    "1"
  );
  
  switch(choice) {
    case "1": return tronTestAmounts.oneTrillion;
    case "2": return tronTestAmounts.hundredBillion;
    case "3": return tronTestAmounts.maxSafe;
    case "4": return tronTestAmounts.stringHuge;
    default: return tronTestAmounts.oneTrillion;
  }
}
