/*
  Running shell commands using Process class.

 This sketch demonstrate how to run linux shell commands
 using a YunShield/Yún. It runs the wifiCheck script on the Linux side
 of the Yún, then uses grep to get just the signal strength line.
 Then it uses parseInt() to read the wifi signal strength as an integer,
 and finally uses that number to fade an LED using analogWrite().

 The circuit:
 * YunShield/Yún with LED connected to pin 9

 created 12 Jun 2013
 by Cristian Maglie
 modified 25 June 2013
 by Tom Igoe

 This example code is in the public domain.

 http://www.arduino.cc/en/Tutorial/ShellCommands

 */

 /**
 * To see the Console, select your Yún's name and IP address in the Port menu. 
 * The Yún will only show up in the Ports menu if your computer is on the same LAN as the Yún. 
 * If your board is on a different network, you won't see it in the Ports menu. Open the Port Monitor. 
 * You'll be prompted for the Yún's password.
 * You can also see the Console by opening a terminal window and typing ssh root@yourYunsName.local (root@seeed.local, 
 * password seeeduino) 'telnet localhost 6571' then pressing enter. 
 * Type H or L to turn on or off the LED
 */

/*
 * ArduinoYun EMA (Eastació Monitorització Aire)
 * 
 * Solució basada en un Arduino Yun
 * Funcionament:
 * 1 - L'arduino monitoritza els sensors
 * 2 - L'arduino envia els valors al Linux mitjançant el mailBox
 * 3 - El Mailbox envia les lectures a un servidor web
 * 
 * 
#Mailbox.py

import socket
import json

def sendMailbox(msg):
    m = {'command':'raw'}
    m['data'] = str(msg)
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect(('127.0.0.1', 5700))
    s.sendall(json.dumps(m))
    s.close()

def recvMailbox():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect(('127.0.0.1', 5700))
    result = json.loads(s.recv(1024))
    s.close()
    return result
 * 
 * 
 * 
 */
#include <Process.h>
#include <Bridge.h>
#include <Mailbox.h>
//#include <Console.h>
#include <Barometer.h>

const int LED_PIN = 13; // the pin that the LED is attached to
const int DUST_PIN = 8; // the dust sensor used pin

//***** Grove - Barometer BMP180 *************************
float temperature = 0;
float pressurePa = 0;
float pressureHPa = 0;  //100Pa = 1HPa = 1mbar
float atm;
float altitude;
Barometer myBarometer;
//********************************************************

//***** Grove - Gas Sensor MQ9 ***************************
int mq9_pin = A1;
float mq9_sensor_volt; 
float mq9_RS_air; //  Get the value of RS via in a clear air
float mq9_R0;  // Get the value of R0 via in LPG
float mq9_sensorValue;
float mq9_RS_gas; // Get value of RS in a GAS
float mq9_ratio; // Get ratio RS_GAS/RS_air
//********************************************************

//***** Grove - Dust Sensor ******************************
int dust_pin = 8;
unsigned long dust_duration;
unsigned long dust_starttime;
unsigned long dust_sampletime_ms = 30000;//sampe 30s&nbsp;;
unsigned long dust_lowpulseoccupancy = 0;
float dust_ratio; 
float dust_concentration = 0;
//********************************************************

void setup() {
  // initialize the LED pin as an output:
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, HIGH);

  Bridge.begin();   // Initialize the Bridge
  Mailbox.begin();   // Initialize the Mailbox

  /*
  Console.begin();  // Initialize the Console

  while (!Console){
    ; // wait for Console port to connect.
  }
  Console.println("You're connected to the Console!!!!");  
  */

  // Grove - Barometer Sensor Initialization -------------
  //Console.print("Initializating barometer");
  myBarometer.init();
  //Console.println("...OK");
  // -----------------------------------------------------

  // Grove - Gas Sensor MQ9 ------------------------------
  //Console.print("Initializating Gas Sensor");
  //Console.println("...OK");
  // -----------------------------------------------------
  // Grove - Gas Sensor MQ9 Calibration (Read R0 when stable)  -------
  mq9_sensorValue = 0;
  /*--- Get a average data by testing 100 times ---*/   
  for(int x = 0 ; x < 100 ; x++)
  {
    mq9_sensorValue = mq9_sensorValue + analogRead(mq9_pin);
  }
  mq9_sensorValue = mq9_sensorValue/100.0;
  /*-----------------------------------------------*/
  mq9_sensor_volt = mq9_sensorValue/1024*5.0;
  mq9_RS_air = (5.0-mq9_sensor_volt)/mq9_sensor_volt; // omit *RL
  mq9_R0 = mq9_RS_air/9.9; // The ratio of RS/R0 is 9.9 in LPG gas from Graph (Found using WebPlotDigitizer)
  //Please node down the mq9_R0 after the reading stabilizes
  
  //Console.print("GAS SENSOR Calibration: sensor_volt = ");
  //Console.print(mq9_sensor_volt);
  //Console.print("V ");
  //Console.print("R0 = ");
  //Console.println(mq9_R0);
  //***************************************************************************

  //Start PYTHON script
  //Run a process asynchronously
  //Please note that since Process.begin(). calls close the running process is terminated. This is the reason why you can not run 2 processes the same time with the same Process instance.
  //p.runShellCommandAsynchronously("cmd")

  // Grove - Dust Sensor Initialization -------------
  //Console.print("Initializating dust sensor");
  pinMode(dust_pin,INPUT);
  dust_starttime = millis();//get the current time;
  //Console.println("...OK");
  // -----------------------------------------------------

  digitalWrite(LED_PIN, LOW);
}

void loop() {
  //***** Grove - Dust Sensor Measurement *************************************
  dust_duration = pulseIn(dust_pin, LOW);
  dust_lowpulseoccupancy = dust_lowpulseoccupancy + dust_duration;
  //***************************************************************************

  if ((millis()-dust_starttime) >= dust_sampletime_ms)//if the sampel time = = 30s
  {
    //Switch on led => Communicating
    digitalWrite(LED_PIN, HIGH);

    //***** Grove - Barometer BMP180 Sensor Measurement *************************
    temperature = myBarometer.bmp085GetTemperature(myBarometer.bmp085ReadUT()); //Get the temperature, bmp085ReadUT MUST be called first
    pressurePa = myBarometer.bmp085GetPressure(myBarometer.bmp085ReadUP());//Get the temperature
    pressureHPa = pressurePa / 100;
    altitude = myBarometer.calcAltitude(pressurePa); //Uncompensated calculation - in Meters 
    atm = pressurePa / 101325; 
    // -----------------------------------------------------
  
    //***** Grove - Gas Sensor MQ9 Measurement **********************************
    mq9_sensorValue = analogRead(mq9_pin);
    mq9_sensor_volt=(float)mq9_sensorValue/1024*5.0;
    mq9_RS_gas = (5.0-mq9_sensor_volt)/mq9_sensor_volt; // omit *RL
    /*-Replace the name "R0" with the value of R0 in the demo of First Test -*/
    mq9_ratio = mq9_RS_gas/mq9_R0;  // ratio = RS/R0 
    /*-----------------------------------------------------------------------*/
    //Console.print("GAS SENSOR Measurement: sensor_volt = ");
    //Console.print(mq9_sensor_volt);
    //Console.print(" RS_ratio = ");
    //Console.print(mq9_RS_gas);
    //Console.print(" Rs/R0 = ");
    //Console.println(mq9_ratio);    
    //***************************************************************************

    //***** Grove - Dust Sensor Measurement *************************************
    //Detecta partícules mes grans de 1micrometre
    dust_ratio = dust_lowpulseoccupancy/(dust_sampletime_ms*10.0);  // Integer percentage 0=&gt;100
    dust_concentration = 1.1*pow(dust_ratio,3)-3.8*pow(dust_ratio,2)+520*dust_ratio+0.62; // using spec sheet curve
    //Serial.print("concentration = ");
    //Serial.print(dust_concentration);
    //Serial.println(" pcs/0.01cf"); //concentració de partícules mes grans d'1 micrometre per peu cúbic.
                                     //cf = cubic foot, 1 cf = 283 ml
                                     //1 metre cúbic = 1000 litres
    //Serial.println("\n");

    //TODO: passar-ho a ug/m3 (micrograms per metre cúbic)
    

    dust_lowpulseoccupancy = 0;
    dust_starttime = millis();
    //***************************************************************************

    //Send values to linino with Mailbox
    Mailbox.writeJSON("[ {\"key\": \"temperature\", \"value\": \"" + String(temperature, 2) + "\"} , {\"key\": \"pressure\", \"value\": \"" + String(pressureHPa, 2) + "\"} , {\"key\": \"dust\", \"value\": \"" + String(dust_concentration, 2) + "\"} ]"); 
    //Switch off led
    digitalWrite(LED_PIN, LOW);  
  }
  
  //delay(10000);  // wait 10 seconds before you do it again
  //delay(30000);  // wait 30 seconds before you do it again
}
