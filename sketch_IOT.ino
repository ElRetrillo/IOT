//  LIBRERIAS
#include <WiFi.h>
#include <PubSubClient.h>

//  DEFINICION DE PINES 
const int MQ_PIN = 34;      
const int PIR_PIN = 25; 
const int BUZZER_PIN = 26;  

//   CREDENCIALES WIFI Y MQTT 

const char* ssid = "A35 de Daniel";      
const char* password = "trigo123";  
const char* mqtt_server = "10.240.247.135"; 
const int mqtt_port = 1883;
const char* mqtt_user = "esp32_user"; 
const char* mqtt_pass = "19082003";

//  TOPICOS MQTT 
const char* MQTT_TOPIC_DATA = "iot/proyecto/data";
const char* MQTT_TOPIC_ALERT = "iot/proyecto/alert";
const char* TOPIC_MODE = "iot/proyecto/mode";

//  VARIABLES GLOBALES Y ESTADOS 
String currentMode = "SALIDA"; 
unsigned long lastBuzzerTime = 0; 

// Cliente WiFi y MQTT
WiFiClient espClient;
PubSubClient client(espClient);

// Variables MQ-135
bool sensorListo = false;
const unsigned long TIEMPO_CALENTAMIENTO = 60000; 
unsigned long tiempoLecturaAnterior = 0;
const unsigned long INTERVALO_LECTURA = 2000;  
const int VALOR_AIRE_LIMPIO = 700;
const int VALOR_AIRE_PELIGROSO = 2500; 
const int UMBRAL_ALERTA_AIRE = VALOR_AIRE_LIMPIO + 1000; 

// Variables PIR y Alarmas
const unsigned long TIEMPO_RECARGA = 5000; 
unsigned long tiempoAlarmaAnterior = 0;
bool alarmaActiva = false; 
int estadoPIRAnterior = LOW; 

//  FUNCIONES AUXILIARES

// Conexión WiFi
void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Conectando a ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi conectado.");
  Serial.print("Dirección IP: ");
  Serial.println(WiFi.localIP());
}

// Callback: Recibir cambio de modo desde Dashboard
void callback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  if (String(topic) == TOPIC_MODE) {
    currentMode = message;
    Serial.println(">>> MODO CAMBIADO A: " + currentMode);

    digitalWrite(BUZZER_PIN, HIGH); delay(50); digitalWrite(BUZZER_PIN, LOW);
  }
}

// Reconexión MQTT
void reconnect_mqtt() {
  while (!client.connected()) {
    Serial.print("Intentando conexión MQTT...");
    String clientId = "ESP32_Proyecto_";
    clientId += String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
      Serial.println("¡Conectado!");
      client.subscribe(TOPIC_MODE);
    } else {
      Serial.print("falló, rc=");
      Serial.print(client.state());
      Serial.println("... reintentando en 5 segundos");
      delay(5000); 
    }
  }
}

// Crear JSON de datos 
String crearJsonDato(String sensor, int valor) {
  String json = "{";
  json += "\"sensor\": \"" + sensor + "\", ";
  json += "\"value\": " + String(valor);
  json += "}";
  return json;
}

// Crear JSON de alerta
String crearJsonAlerta(String tipo, String sensor, String msg) {
  String json = "{";
  json += "\"type\": \"" + tipo + "\", ";
  json += "\"sensor\": \"" + sensor + "\", ";
  json += "\"message\": \"" + msg + "\"";
  json += "}";
  return json;
}


void sonarBuzzerAlerta() {
  for(int i=0; i<3; i++){
    digitalWrite(BUZZER_PIN, HIGH);
    delay(100);
    digitalWrite(BUZZER_PIN, LOW);
    delay(100);
  }
}

// Trigger de alarmas 
void dispararAlarma(String motivo) {
  if (alarmaActiva == false) {
    Serial.print("\n¡¡ENVIANDO CORREO DE ALERTA!! Motivo: ");
    Serial.println(motivo);
    
    String jsonAlerta = crearJsonAlerta("CalidadAire", "MQ-135", motivo);
    client.publish(MQTT_TOPIC_ALERT, jsonAlerta.c_str());

    alarmaActiva = true;            
    tiempoAlarmaAnterior = millis(); 
  }
}

//  GESTION DE SENSORES 

void gestionarMQ135() {
  if (sensorListo == false) {
    if (millis() >= TIEMPO_CALENTAMIENTO) {
      sensorListo = true;
      Serial.println("\n¡SENSOR DE AIRE LISTO!");
      tiempoLecturaAnterior = millis();
    }
    return;
  }

  if (millis() - tiempoLecturaAnterior >= INTERVALO_LECTURA) {
    tiempoLecturaAnterior = millis();

    int valorAnalogico = analogRead(MQ_PIN);
    Serial.print("Aire: "); Serial.println(valorAnalogico);
    
    // enviar el dato para el dashboard
    String jsonData = crearJsonDato("mq135", valorAnalogico);
    client.publish(MQTT_TOPIC_DATA, jsonData.c_str());

    //  Lógica de Alertas
    if (valorAnalogico > UMBRAL_ALERTA_AIRE) {
      
      // MODO HOGAR: Buzzer si, Correo no
      if (currentMode == "HOGAR") {
        if (millis() - lastBuzzerTime > 15000) { 
          lastBuzzerTime = millis();
          Serial.println("Aire Malo (HOGAR): Sonando buzzer...");
          sonarBuzzerAlerta();
        }
      } 
      // MODO SALIDA: Buzzer no, Correo si
      else if (currentMode == "SALIDA") {
        if (!alarmaActiva) {
          Serial.println("Aire Malo (SALIDA): Enviando correo...");
          dispararAlarma("Mala Calidad de Aire - Casa Sola"); 
        }
      }
    }
  }
}

void gestionarPIR() {
  int estadoPIRActual = digitalRead(PIR_PIN);

  if (estadoPIRActual == HIGH && estadoPIRAnterior == LOW) {
    Serial.println("Movimiento detectado (Solo Registro)");
    
    String jsonData = crearJsonDato("pir", 1);
    client.publish(MQTT_TOPIC_DATA, jsonData.c_str());
  }
  estadoPIRAnterior = estadoPIRActual;
}

//SETUP Y LOOP PRINCIPAL

void setup() {
  Serial.begin(115200);
  Serial.println("\n--- Iniciando Sistema IOT ---");

  pinMode(PIR_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  estadoPIRAnterior = digitalRead(PIR_PIN); 

  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);

  Serial.println("Esperando calentamiento de sensores...");
}

void loop() {
  if (!client.connected()) reconnect_mqtt();
  client.loop(); 

  gestionarMQ135();
  gestionarPIR();

  // Gestión de tiempo de recarga 
  if (alarmaActiva) {
    if (millis() - tiempoAlarmaAnterior >= TIEMPO_RECARGA) {
      alarmaActiva = false;       
      Serial.println("Sistema de correo reactivado.");
    }
  }
}