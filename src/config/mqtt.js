const mqtt = require('mqtt');

// HiveMQ Cloud broker configuration
const MQTT_CONFIG = {
  host: process.env.MQTT_BROKER_URL || 'broker.hivemq.com',
  port: process.env.MQTT_BROKER_PORT || 8000,
  protocol: 'ws',
  clientId: `smart_shelf_backend_${Math.random().toString(16).slice(3)}`,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
};

let mqttClient = null;

function connectMQTT() {
  if (mqttClient && mqttClient.connected) {
    return mqttClient;
  }

  const brokerUrl = `${MQTT_CONFIG.protocol}://${MQTT_CONFIG.host}:${MQTT_CONFIG.port}/mqtt`;
  
  console.log(`🔌 Connecting to MQTT broker: ${brokerUrl}`);
  
  mqttClient = mqtt.connect(brokerUrl, {
    clientId: MQTT_CONFIG.clientId,
    clean: MQTT_CONFIG.clean,
    connectTimeout: MQTT_CONFIG.connectTimeout,
    reconnectPeriod: MQTT_CONFIG.reconnectPeriod,
  });

  mqttClient.on('connect', () => {
    console.log('✅ MQTT connected successfully');
  });

  mqttClient.on('error', (error) => {
    console.error('❌ MQTT connection error:', error);
  });

  mqttClient.on('offline', () => {
    console.log('⚠️ MQTT client offline');
  });

  mqttClient.on('reconnect', () => {
    console.log('🔄 MQTT reconnecting...');
  });

  return mqttClient;
}

function getMQTTClient() {
  if (!mqttClient) {
    return connectMQTT();
  }
  return mqttClient;
}

function publishMessage(topic, message) {
  return new Promise((resolve, reject) => {
    const client = getMQTTClient();
    
    if (!client.connected) {
      return reject(new Error('MQTT client not connected'));
    }

    const payload = typeof message === 'string' ? message : JSON.stringify(message);
    
    client.publish(topic, payload, { qos: 1 }, (error) => {
      if (error) {
        console.error(`❌ Failed to publish to ${topic}:`, error);
        reject(error);
      } else {
        console.log(`📤 Published to ${topic}:`, payload);
        resolve();
      }
    });
  });
}

module.exports = {
  connectMQTT,
  getMQTTClient,
  publishMessage,
};
