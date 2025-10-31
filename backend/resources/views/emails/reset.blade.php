<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Reset Your Password | Swapify</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            background-color: #f9fafc;
            color: #333;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 580px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
            padding: 30px;
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
            display: block;
            width: 200px;
            margin: 25px auto;
            background: #ee6931;
            color: #fff !important;
            text-align: center;
            padding: 12px 0;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
        }

        .btn:hover {
            background: #0056b3;
        }

        .footer {
            font-size: 12px;
            text-align: center;
            color: #999;
            margin-top: 25px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <img src="cid:logo.png" alt="Swapify Logo" width="120" style="display:block;margin:auto;">
        </div>
        <h1>Password Reset Request</h1>
        <p>Hello {{ $user->full_name ?? $user->username }},</p>
        <p>We received a request to reset your Swapify account password. Click the button below to set a new password:
        </p>

        <a href="{{ $url }}" class="btn">Reset Password</a>

        <p>If you didn’t request a password reset, you can safely ignore this email.</p>

        <div class="footer">
            &copy; {{ date('Y') }} Swapify. All rights reserved.
        </div>
    </div>
</body>

</html>
