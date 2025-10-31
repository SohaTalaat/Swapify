<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Verify Your Email | Swapify</title>
    <style>
        body {
            font-family: 'Poppins', Arial, sans-serif;
            background-color: #f4f6f8;
            color: #333;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 580px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
            padding: 30px;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        h1 {
            font-size: 22px;
            color: #222;
            text-align: center;
        }

        p {
            font-size: 15px;
            line-height: 1.6;
            color: #555;
        }

        .btn {
            display: inline-block;
            margin: 25px 0;
            padding: 12px 25px;
            background-color: #ee6931;
            color: #fff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
        }

        .btn:hover {
            background-color: #00885a;
        }

        .footer {
            text-align: center;
            color: #999;
            font-size: 12px;
            margin-top: 25px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <img src="cid:logo.png" alt="Swapify Logo" width="120" style="display:block;margin:auto;">
        </div>
        <h1>Welcome to Swapify!</h1>
        <p>Hi {{ $user->full_name ?? $user->username }},</p>
        <p>Thank you for signing up. To start swapping and listing items securely, please verify your email by clicking
            the button below:</p>

        <div style="text-align:center;">
            <a href="{{ $url }}" class="btn">Verify Email</a>
        </div>

        <p>If you didn’t create a Swapify account, you can safely ignore this email.</p>

        <div class="footer">
            &copy; {{ date('Y') }} Swapify. All rights reserved.
        </div>
    </div>
</body>

</html>
