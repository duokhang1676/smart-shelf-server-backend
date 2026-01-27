const { publishMessage } = require('../config/mqtt');

/**
 * Webhook endpoint nhận notification từ SePay khi có giao dịch chuyển khoản
 * POST /webhook/sepay-webhook
 */
exports.handleSepayWebhook = async (req, res) => {
  try {
    console.log('📥 Received SePay webhook:', JSON.stringify(req.body, null, 2));

    // Parse webhook payload từ SePay
    const {
      id,                    // Transaction ID từ SePay
      gateway,              // Tên ngân hàng
      transaction_date,     // Thời gian giao dịch
      account_number,       // Số tài khoản nhận tiền
      sub_account,         // Số phụ (nếu có)
      amount_in,           // Số tiền nhận được
      amount_out,          // Số tiền chuyển đi (thường là 0)
      accumulated,         // Tổng tiền tích lũy
      code,                // Mã giao dịch ngân hàng
      transaction_content, // Nội dung chuyển khoản
      reference_number,    // Số tham chiếu
      body,                // Nội dung chi tiết
    } = req.body;

    // Validate required fields
    if (!transaction_content || !amount_in) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: transaction_content or amount_in'
      });
    }

    // Extract order_id từ transaction_content
    // Format: "SMART SHELF ORDER_123456" hoặc "ORDER_123456"
    const orderIdMatch = transaction_content.match(/ORDER[_\s]?(\d+)/i);
    const orderId = orderIdMatch ? orderIdMatch[1] : null;

    // Prepare MQTT message payload
    const mqttPayload = {
      transaction_id: id,
      order_id: orderId,
      amount: amount_in,
      transaction_content,
      bank: gateway,
      transaction_date,
      account_number,
      code,
      reference_number,
      status: 'success',
      timestamp: new Date().toISOString(),
    };

    // Publish to MQTT topic: payment/notification
    const topic = 'payment/notification';
    await publishMessage(topic, mqttPayload);

    console.log(`✅ Payment notification published to MQTT topic: ${topic}`);
    console.log(`   Order ID: ${orderId || 'N/A'}`);
    console.log(`   Amount: ${amount_in} VND`);

    // Response to SePay
    res.status(200).json({
      success: true,
      message: 'Webhook received and forwarded to MQTT',
      data: {
        order_id: orderId,
        amount: amount_in,
        transaction_id: id,
      }
    });

  } catch (error) {
    console.error('❌ Error handling SePay webhook:', error);
    
    // Vẫn trả về 200 để SePay không retry liên tục
    res.status(200).json({
      success: false,
      error: error.message,
      message: 'Webhook received but failed to process'
    });
  }
};

/**
 * Test endpoint để kiểm tra MQTT connection
 * POST /webhook/test-mqtt
 */
exports.testMQTT = async (req, res) => {
  try {
    const testPayload = {
      message: 'Test MQTT from backend',
      timestamp: new Date().toISOString(),
      ...req.body
    };

    const topic = req.body.topic || 'payment/notification';
    await publishMessage(topic, testPayload);

    res.json({
      success: true,
      message: `Test message published to topic: ${topic}`,
      payload: testPayload
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
