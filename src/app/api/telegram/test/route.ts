import { NextResponse } from 'next/server';

export async function GET() {
  console.log('=== Telegram Test API Called ===');

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  console.log('Bot Token exists:', !!botToken);
  console.log('Bot Token length:', botToken?.length);
  console.log('Chat ID:', chatId);

  if (!botToken || !chatId) {
    return NextResponse.json({
      success: false,
      error: 'Missing credentials',
      hasToken: !!botToken,
      hasChatId: !!chatId,
    });
  }

  try {
    // Test: Get bot info
    const botInfoUrl = `https://api.telegram.org/bot${botToken}/getMe`;
    const botInfoResponse = await fetch(botInfoUrl);
    const botInfo = await botInfoResponse.json();

    console.log('Bot info:', botInfo);

    // Test: Send a test message
    const testMessage = '🔧 ტესტი - Telegram ინტეგრაცია მუშაობს!';
    const sendUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const sendResponse = await fetch(sendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: testMessage,
      }),
    });

    const sendResult = await sendResponse.json();
    console.log('Send result:', sendResult);

    return NextResponse.json({
      success: sendResponse.ok,
      botInfo,
      sendResult,
    });
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: String(error),
    });
  }
}
