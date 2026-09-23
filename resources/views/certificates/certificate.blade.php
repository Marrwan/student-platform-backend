<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Certificate of Completion</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #090d16;
            color: #ffffff;
            margin: 0;
            padding: 40px;
            text-align: center;
        }
        .border-box {
            border: 8px double #6366f1;
            padding: 40px;
            background-color: #111827;
            border-radius: 12px;
        }
        .header {
            font-size: 36px;
            font-weight: bold;
            color: #6366f1;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 10px;
        }
        .subheader {
            font-size: 18px;
            color: #9ca3af;
            margin-bottom: 30px;
        }
        .student-name {
            font-size: 32px;
            font-weight: bold;
            color: #06b6d4;
            margin: 20px 0;
            border-bottom: 2px solid #374151;
            display: inline-block;
            padding-bottom: 8px;
        }
        .course-title {
            font-size: 24px;
            font-weight: 600;
            color: #f3f4f6;
            margin: 15px 0;
        }
        .details {
            font-size: 14px;
            color: #9ca3af;
            margin-top: 40px;
        }
        .code {
            font-family: monospace;
            color: #10b981;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div class="border-box">
        <div class="header">Certificate of Completion</div>
        <div class="subheader">This is proudly presented to</div>
        
        <div class="student-name">{{ $user->full_name }}</div>
        
        <p style="color: #9ca3af; font-size: 16px;">for successfully completing all requirements & capstones for</p>
        
        <div class="course-title">{{ $course->title }}</div>
        
        <div class="details">
            <p>Issued on: <strong>{{ $certificate->issued_at->format('F d, Y') }}</strong></p>
            <p>Certificate Code: <span class="code">{{ $certificate->certificate_code }}</span></p>
            <p>Verification Code: <span class="code">{{ $certificate->uuid }}</span></p>
        </div>
    </div>
</body>
</html>
