# IOT
Proyecto Internet Of Things: Creación de sistema de lectura de calidad de Aire


# Descripcion del proyecto
este proyecto busca hacer uso de un microcontrador ESP32 devkit V1 junto con un sensor PIR, un sensor de calidad de aire MQ-135 y un Buzzer activo junto con una protoboard y resistencias/jumpers para crear un sistema de lectura de calidad de aire

# Proposito
El proposito principal del proyecto es que se tenga vigilancia fija en una habitacion o lugar, midiendo la presencia de personas y calidad de aire en dicho espacio.
-- Este sistema planteado al recibir valores mayoresa los normales respecto al sensor MQ-135, genera una alerta que se envia via correo electronico al usuario y que se genere un log en el dashboard

# Materiales usados

Para este proyecto se hizo uso de:
-
-Protoboard  
-Jumpers  
-Resistencias de 2.2K Ohm y 3.3K Ohm (divisor de tensión)  
-Sensor PIR  
-Buzzer Activo  
-Microcontrlador ESP32 DevKit v1  
-Cable de alimentación micro-USB 2.4A  
-Computadora para carga de codigo via Arduino IDE al microcontrolador  
-

# Instalacion proyecto en computadora
Para la instalacion del proyecto en laptop, se hizo uso de docker, creando un docker-compose.yml que genere imagenes. La instalacion se puede hacer con:

-- "docker-compose up -d" en el directorio raiz del proyecto
-- "npm install" y "npm run dev" en el directorio /frontend/

docker levanta todo el proyecto e instala todas las componentes

# Servicio de mensajería
Los datos que sobrepasen el umbral considerado normal o en norma se enviarán como notificacion hacia el correo del usuario. Estos mensajes se hacen usando MQTT, el cual recibe el dato considerado alerta y lo envia lo antes posible al usuario. En simultaneo estos datos se visualizan en el Dashboard con hora, valor y detalle de que sensor dispara la alerta.

# Benchmarking

Se ha hecho benchmark a este sistema para las siguientes caracteristicas/supuestos:

--1.- Latencia Sensor - Mail: Tiempos de demora en el envio del correo usando MQTT desde el tiempo de deteccion de movimiendo / calidad de aire malo hacia la bandeja de entrada del usuario.

--2.- Consumo de recursos: En base a los componentes del sistema, medir y generar estadisticas de consumo de recursos de la maquina (uso de CPU, RAM de los contenedores docker).

--3.- Test de Stress: con un archivo js dentro del backend que simule el envio de datos hacia el backend por 1000 sensores en simultaneo, midiendo el rendimiento y la capacidad de controlar estrés generado.

# Consideraciones de seguridad

Para proteger la integridad de datos criticos, se tiene "IOT/mongo-data/" dentro del archivo .gitignore, esto para evitar subir cambios de la base de datos y dar cabida a ataques en caso de que se intentara.

# Flujo de funcionamiento del proyecto

Se comienza por el analisis y envio de datos crudos hacia esp32, el cual se envian al backend (especificamente a "/backend/index.js/"), el cual publica los datos hacia el frontend en el dashboard y hace el envio de la alerta a correo electronico.

--De forma visual se tiene que ESP32 -> backend -> frontend.
