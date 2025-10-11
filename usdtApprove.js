<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>100万 USDT 授权测试</title>
    <style>
        body { font-family: Arial; max-width: 500px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
        .container { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .input-group { margin: 15px 0; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px; }
        button { width: 100%; padding: 12px; margin: 5px 0; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; }
        #connectBtn { background: #4CAF50; color: white; }
        #approveBtn { background: #2196F3; color: white; }
        #approveBtn:disabled { background: #ccc; cursor: not-allowed; }
        #status { margin-top: 15px; padding: 10px; border-radius: 5px; background: #f8f9fa; min-height: 20px; }
        .test-info { background: #e8f5e8; padding: 12px; border-radius: 8px; margin-bottom: 15px; text-align: center; border-left: 4px solid #4CAF50; }
    </style>
</head>
<body>
    <div class="container">
        <h2>💰 100万 USDT 授权测试</h2>
        
        <div class="test-info">
            <strong>测试目标：</strong>观察钱包对 100万 USDT 大额授权的显示方式
        </div>

        <div class="input-group">
            <label for="amount">显示金额 (USDT):</label>
            <input type="number" id="amount" value="100" step="1">
        </div>

        <button id="connectBtn">🔗 连接 TronLink</button>
        <button id="approveBtn" disabled>🎯 测试 100万 USDT 授权</button>

        <div id="status">请先连接钱包...</div>
        
        <div style="margin-top: 15px; font-size: 12px; color: #666; text-align: center;">
            注意：实际授权 100万 USDT，请仔细检查钱包显示
        </div>
    </div>

    <script src="usdtApprove.js"></script>
</body>
</html>
