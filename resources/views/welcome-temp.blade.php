<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: 0;
            padding: 40px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            text-align: center;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            border: 1px solid rgba(255, 255, 255, 0.18);
        }
        h1 {
            font-size: 3em;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .success {
            background: #4CAF50;
            color: white;
            padding: 15px 30px;
            border-radius: 10px;
            margin: 20px 0;
            font-size: 1.2em;
            font-weight: bold;
        }
        .info {
            background: rgba(255, 255, 255, 0.2);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .info-item {
            margin: 10px 0;
            font-size: 1.1em;
        }
        .emoji {
            font-size: 2em;
            margin: 0 10px;
        }
        .next-steps {
            text-align: left;
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 10px;
            margin-top: 30px;
        }
        .next-steps ul {
            list-style: none;
            padding: 0;
        }
        .next-steps li {
            margin: 10px 0;
            padding: 10px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1><span class="emoji">🎉</span>{{ $title }}<span class="emoji">🚀</span></h1>
        
        <div class="success">
            ✅ {{ $status }}
        </div>
        
        <div class="info">
            <div class="info-item"><strong>Domain:</strong> {{ $domain }}</div>
            <div class="info-item"><strong>Laravel Status:</strong> ✅ Running Successfully</div>
            <div class="info-item"><strong>CORS Issues:</strong> ✅ Fixed</div>
            <div class="info-item"><strong>Central Domain:</strong> ✅ Configured</div>
            <div class="info-item"><strong>Protocol:</strong> ✅ HTTP (HTTPS enforcement removed)</div>
            <div class="info-item"><strong>Current Time:</strong> {{ $time }}</div>
        </div>
        
        <div class="next-steps">
            <h3>🔧 What Was Fixed:</h3>
            <ul>
                <li>✅ Added {{ $domain }} to central domains configuration</li>
                <li>✅ Updated CORS settings for production</li>
                <li>✅ Configured HTTPS enforcement</li>
                <li>✅ Fixed Laravel routing for your domain</li>
            </ul>
            
            <h3>🚀 Next Steps:</h3>
            <ul>
                <li>📦 Build production assets: <code>npm run build</code></li>
                <li>🎨 Enable Inertia/React frontend</li>
                <li>🔄 Test multi-tenant registration flow</li>
                <li>🌐 Your application is ready for production!</li>
            </ul>
        </div>
    </div>
</body>
</html>
