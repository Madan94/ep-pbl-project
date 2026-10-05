/*
 * RenewCred - ESP32 Smart Solar Node (Wi-Fi Client Mode)
 * ============================================================================
 * Configure credentials in the ignored config.h file.
 *
 * Hardware:
 *   - ESP32 Development Board
 *   - 0.96" OLED I2C Display (SSD1306) [SDA: GPIO 21, SCL: GPIO 22]
 *   - DHT22 Sensor                     [DATA: GPIO 4]
 *   - Push Button                      [PIN: GPIO 15, INPUT_PULLUP]
 *   - Green LED (Normal / Verified)    [PIN: GPIO 18]
 *   - Red LED   (Anomaly Alert)        [PIN: GPIO 19]
 *   - Blue LED  (Wi-Fi Connected)      [PIN: GPIO 2]
 *   - Buzzer    (Audio Feedback)       [PIN: GPIO 23]
 * ============================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>

// ===========================================================================
// Wi-Fi & Laptop Backend Configuration
// ===========================================================================
// Copy config.example.h to config.h and fill in your local settings.
#include "config.h"

// Device Identifier
const char* DEVICE_ID = "RENEWCRED-001";
const unsigned long TELEMETRY_INTERVAL_MS = 5000; // Send every 5 seconds

// ===========================================================================
// Pin Definitions
// ===========================================================================
#define PIN_DHT22         4
#define PIN_BUTTON       15
#define PIN_LED_GREEN    18
#define PIN_LED_RED      19
#define PIN_LED_BLUE      2
#define PIN_BUZZER       23

// OLED Display Configuration
#define SCREEN_WIDTH  128
#define SCREEN_HEIGHT  64
#define OLED_RESET     -1
#define SCREEN_ADDRESS 0x3C

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
DHT dht(PIN_DHT22, DHT22);

// State Variables
unsigned long lastTransmitTime = 0;
unsigned long buttonPressStart = 0;
bool buttonHeld = false;
bool forceAnomaly = false;
int displayPage = 0;
unsigned int txCount = 0;
String lastStatus = "CONNECTING";
String apiUrl;

float voltage = 12.40;
float current = 1.85;
float power = 22.94;
float temperature = 28.5;
float humidity = 55.0;
float carbon = 0.0340;

// ===========================================================================
// Sound & Visual Helpers
// ===========================================================================
void beep(int freq, int durationMs) {
  tone(PIN_BUZZER, freq, durationMs);
}

void indicateNormal() {
  digitalWrite(PIN_LED_GREEN, HIGH);
  digitalWrite(PIN_LED_RED, LOW);
  beep(2400, 50);
}

void indicateAnomaly() {
  digitalWrite(PIN_LED_GREEN, LOW);
  digitalWrite(PIN_LED_RED, HIGH);
  tone(PIN_BUZZER, 1000, 150);
  delay(160);
  tone(PIN_BUZZER, 800, 200);
}

// ===========================================================================
// Telemetry & Prototype Carbon Estimation Engine
// ===========================================================================
void generateTelemetry(bool injectAnomaly) {
  // 1. Read real DHT22
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  if (!isnan(t)) temperature = t;
  if (!isnan(h)) humidity = h;

  // 2. Solar Photovoltaic thermal model
  float tempVoltageDrop = (temperature - 25.0) * 0.04;
  float sunDrift = (sin(millis() / 7000.0) * 0.4) + (random(-6, 6) / 100.0);

  voltage = 12.60 - tempVoltageDrop + sunDrift;
  if (voltage < 11.2) voltage = 11.2;
  if (voltage > 13.8) voltage = 13.8;
  voltage = round(voltage * 100.0) / 100.0;

  current = 1.82 + (sunDrift * 0.45) + (random(-4, 4) / 100.0);
  if (current < 1.0) current = 1.0;
  if (current > 2.8) current = 2.8;
  current = round(current * 100.0) / 100.0;

  power = round((voltage * current) * 100.0) / 100.0;

  // 3. Prototype Carbon Offset estimate (kg CO2e)
  carbon = round(((temperature * 0.001) + (humidity * 0.0001)) * 10000.0) / 10000.0;

  if (injectAnomaly) {
    power = round(power * 2.6 * 100.0) / 100.0; // Injected 260% power mismatch
  }
}

// ===========================================================================
// OLED Display Screens
// ===========================================================================
void renderOLED() {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);

  if (displayPage == 0) {
    // Screen 0: Live Telemetry & Carbon
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.print("RenewCred ");
    display.print(DEVICE_ID);
    display.drawFastHLine(0, 10, 128, SSD1306_WHITE);

    display.setCursor(0, 14);
    display.printf("Temp:  %.1f C  Hum: %.0f%%\n", temperature, humidity);
    display.setCursor(0, 24);
    display.printf("Volt:  %.2f V  Curr: %.2fA\n", voltage, current);
    display.setCursor(0, 34);
    display.printf("Power: %.2f W\n", power);
    display.setCursor(0, 44);
    display.printf("CO2:   %.4f kg\n", carbon);

    display.drawFastHLine(0, 53, 128, SSD1306_WHITE);
    display.setCursor(0, 56);
    display.printf("#%u | [%s]", txCount, lastStatus.c_str());
  } 
  else if (displayPage == 1) {
    // Screen 1: Network & Wi-Fi Info
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.println("Wi-Fi Network Info");
    display.drawFastHLine(0, 10, 128, SSD1306_WHITE);

    display.setCursor(0, 15);
    display.printf("SSID: %s\n", WIFI_SSID);
    display.setCursor(0, 26);
    display.printf("IP:   %s\n", WiFi.localIP().toString().c_str());
    display.setCursor(0, 37);
    display.printf("RSSI: %d dBm\n", WiFi.RSSI());
    display.setCursor(0, 49);
    display.printf("AI:   %s\n", lastStatus.c_str());
  }
  else {
    // Screen 2: Carbon Offset Summary
    display.setTextSize(1);
    display.setCursor(0, 0);
    display.println("Carbon Offset dMRV");
    display.drawFastHLine(0, 10, 128, SSD1306_WHITE);

    display.setCursor(0, 16);
    display.printf("Packets: %u\n", txCount);
    display.setCursor(0, 28);
    display.printf("Carbon: %.4f kg\n", carbon);
    display.setCursor(0, 40);
    display.printf("Credits: %.6f\n", carbon / 1000.0);
    display.setCursor(0, 54);
    display.println("Status: ONLINE");
  }

  display.display();
}

// ===========================================================================
// Setup
// ===========================================================================
void setup() {
  Serial.begin(115200);

  pinMode(PIN_BUTTON, INPUT_PULLUP);
  pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(PIN_LED_RED, OUTPUT);
  pinMode(PIN_LED_BLUE, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);

  digitalWrite(PIN_LED_GREEN, LOW);
  digitalWrite(PIN_LED_RED, LOW);
  digitalWrite(PIN_LED_BLUE, LOW);
  digitalWrite(PIN_BUZZER, LOW);

  dht.begin();

  Wire.begin(21, 22);
  if (display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(5, 10);
    display.println("RenewCred Node");
    display.setCursor(5, 25);
    display.println("Connecting: Kk...");
    display.display();
  }

  apiUrl = "http://" + String(BACKEND_SERVER_IP) + ":" + String(BACKEND_PORT) + "/api/sensor-data";
  Serial.println("\n=============================================");
  Serial.println("   RenewCred ESP32 Online Wi-Fi Node         ");
  Serial.printf("   Target SSID:    %s\n", WIFI_SSID);
  Serial.printf("   Target Backend: %s\n", apiUrl.c_str());
  Serial.println("=============================================");

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(350);
    Serial.print(".");
    digitalWrite(PIN_LED_BLUE, !digitalRead(PIN_LED_BLUE));
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(PIN_LED_BLUE, HIGH);
    beep(2200, 120);
    Serial.println("\n[Wi-Fi] Connected to Kk Successfully!");
    Serial.printf("[Wi-Fi] ESP32 IP: %s\n", WiFi.localIP().toString().c_str());
    lastStatus = "ONLINE";
  } else {
    digitalWrite(PIN_LED_BLUE, LOW);
    digitalWrite(PIN_LED_RED, HIGH);
    Serial.println("\n[Wi-Fi] Could not connect to Kk. Retrying in background...");
    lastStatus = "NO_WIFI";
  }

  renderOLED();
}

// ===========================================================================
// Main Loop
// ===========================================================================
void loop() {
  // 1. Handle Push Button
  if (digitalRead(PIN_BUTTON) == LOW) {
    if (buttonPressStart == 0) {
      buttonPressStart = millis();
      buttonHeld = false;
    } else if (millis() - buttonPressStart > 1200 && !buttonHeld) {
      buttonHeld = true;
      forceAnomaly = true;
      beep(900, 300);
      Serial.println("[BUTTON] Long press! Anomaly armed.");
      renderOLED();
    }
  } else {
    if (buttonPressStart > 0) {
      unsigned long duration = millis() - buttonPressStart;
      buttonPressStart = 0;
      if (!buttonHeld && duration > 50 && duration < 1000) {
        displayPage = (displayPage + 1) % 3;
        beep(2000, 40);
        renderOLED();
      }
    }
  }

  // 2. Periodic Telemetry Transmission (Every 5 Seconds)
  if (millis() - lastTransmitTime >= TELEMETRY_INTERVAL_MS) {
    lastTransmitTime = millis();

    bool injectingAnomaly = forceAnomaly;
    forceAnomaly = false;

    // Always generate real sensor telemetry from DHT22
    generateTelemetry(injectingAnomaly);
    txCount++;

    // Blue LED blink for activity
    digitalWrite(PIN_LED_BLUE, LOW);
    delay(30);
    digitalWrite(PIN_LED_BLUE, HIGH);

    StaticJsonDocument<256> doc;
    doc["device_id"]   = DEVICE_ID;
    doc["temperature"] = temperature;
    doc["humidity"]    = humidity;
    doc["voltage"]     = voltage;
    doc["current"]     = current;
    doc["power"]       = power;
    doc["carbon"]      = carbon;

    String payload;
    serializeJson(doc, payload);

    // ALWAYS print JSON payload to Serial for USB Bridge & debugging
    Serial.printf("[TX #%04d] %s\n", txCount, payload.c_str());

    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(apiUrl);
      http.addHeader("Content-Type", "application/json");
      http.setTimeout(3500);

      int httpCode = http.POST(payload);

      if (httpCode == 200) {
        String response = http.getString();
        StaticJsonDocument<512> respDoc;
        DeserializationError err = deserializeJson(respDoc, response);

        if (!err) {
          const char* st = respDoc["status"];
          lastStatus = st ? String(st) : "NORMAL";
        } else {
          lastStatus = "NORMAL";
        }

        if (lastStatus == "ANOMALY") {
          indicateAnomaly();
        } else {
          indicateNormal();
        }
      } else {
        lastStatus = "HTTP_ERR";
      }

      http.end();
    } else {
      lastStatus = "NO_WIFI";
      Serial.println("[Wi-Fi] Retrying configured Wi-Fi connection...");
      WiFi.reconnect();
      if (injectingAnomaly) {
        indicateAnomaly();
      } else {
        indicateNormal();
      }
    }

    renderOLED();
  }
}


