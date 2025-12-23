import { NextRequest, NextResponse } from 'next/server';

interface TelegramOrderRequest {
  serviceType: string;
  subType: string;
  pickupAddress: string;
  dropoffAddress: string;
  customerPrice: number;
  phone: string;
  distance: number;
}

export async function POST(request: NextRequest) {
  console.log('=== Telegram API Route Called ===');

  try {
    const body: TelegramOrderRequest = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));

    const { serviceType, subType, pickupAddress, dropoffAddress, customerPrice, phone, distance } = body;

    const serviceLabel = serviceType === 'cargo' ? 'ტვირთი' : 'ევაკუატორი';

    const message = `
🚗 ახალი შეკვეთა!

📦 სერვისი: ${serviceLabel} (${subType})
📍 აყვანა: ${pickupAddress}
📍 ჩაბარება: ${dropoffAddress}
📏 მანძილი: ${distance.toFixed(1)} კმ
💰 ფასი: ${customerPrice}₾
📞 ტელეფონი: ${phone}
    `.trim();

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    console.log('Bot Token exists:', !!botToken);
    console.log('Chat ID:', chatId);

    if (!botToken || !chatId) {
      console.error('Missing Telegram credentials - Bot Token:', !!botToken, 'Chat ID:', !!chatId);
      return NextResponse.json(
        { error: 'Missing Telegram credentials' },
        { status: 500 }
      );
    }

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    console.log('Telegram URL:', telegramUrl.replace(botToken, 'BOT_TOKEN_HIDDEN'));

    const telegramPayload = {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    };
    console.log('Telegram payload:', JSON.stringify(telegramPayload, null, 2));

    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(telegramPayload),
    });

    const responseData = await response.json();
    console.log('Telegram API response status:', response.status);
    console.log('Telegram API response:', JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      console.error('Telegram API error:', responseData);
      return NextResponse.json(
        { error: 'Failed to send Telegram notification', details: responseData },
        { status: 500 }
      );
    }

    console.log('=== Telegram notification sent successfully ===');
    return NextResponse.json({ success: true, telegramResponse: responseData });
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
