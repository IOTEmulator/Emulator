const express = require("express");
const app = express();
var cors = require("cors");
app.use(cors());
// event emiter
const event = require("events");
const emitter = event.EventEmitter();
//將 express 放進 http 中開啟 Server 的 3030 port ，正確開啟後會在 console 中印出訊息
const server = require("http")
  .Server(app)
  .listen(3030, () => {
    console.log("open server!");
  });

//將啟動的 Server 送給 socket.io 處理
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

// import util common module
const {
  convertToBuffer,
  convertToString,
  combineSysex,
  disassembleSysex,
  writeToFile,
  voltToHex,
  returnAnalogReportBufData
} = require("./util/format");

// Firmata Protocol Format
const firmataProtocol = require("./protocol/protocol");

// Dependencies SerialPort ^9.0.2
const SerialPort = require("serialport");

// get mapping data
const { ledColorMap, pinMap } = require("./mapping/mapping");

/**
 * Firmata Protocol Query Hex Constants
 */
const PROTOCOL_VERSION_QUERY = "f9";
const FIRMWARE_QUERY = "79";
const CAPABILITY_QUERY = "6b";
const ANALOG_MAPPING_QUERY = "69";
// i2c (see https://github.com/firmata/protocol/blob/master/i2c.md)
// This must be called prior to any I2C reads or writes
const I2C_CONFIG_QUERY = "78";
const I2C_WRITE_REQUEST_QUERY = "76"; //+'0100020003000500f7f07601100600';

/**
 * Firmata Protocol Responce Hex Constants
 */

// firmata protocol version
const PROTOCOL_VERSION_RESPONSE = "f90205";
const FIRMWARE_RESPONSE = "79" + "0205"; // same as query lol
const CAPABILITY_RESPONSE =
  "6c" +
  "6c7f7f00010b010101040e7f00010b0101010308040e7f00010b010101040e7f00010b0101010308040e7f00010b0101010308040e7f00010b010101040e7f00010b010101040e7f00010b0101010308040e7f00010b0101010308040e7f00010b0101010308040e7f00010b010101040e7f00010b010101040e7f00010b010101020a040e7f00010b010101020a040e7f00010b010101020a040e7f00010b010101020a040e7f00010b010101020a040e06017f00010b010101020a040e06017f";
const ANALOG_MAPPING_RESPONSE =
  "6a" + "7f7f7f7f7f7f7f7f7f7f7f7f7f7f000102030405";
const I2C_RESPONCE = "77" + "01000000000000000000000000000000";

/**
 * I2C toggle
 */
let i2cIsOpen = false;

/**
 * test function place
 */
// voltToHex(0);
/**
 * serialport open, connect, waiting for data, write data to Johnny-five.
 *
 */

const bindingPort = "COM5";

let serialPort = new SerialPort(bindingPort, {
  baudRate: 57600,
});

serialPort.on("open", () => readData());
//監聽 Server 連線後的所有事件，並捕捉事件 socket 執行
io.on("connection", (socket) => {
  //經過連線後在 console 中印出訊息
  console.log("success connect! Server side");
  //監聽透過 connection 傳進來的事件
  socket.on("getMessage", (message) => {
    //回傳 message 給發送訊息的 Client
    socket.emit("getMessage", "from server msg");
    console.log("msg : " + "server msg");
    // this.emitter.on("portconnect", (data) => {
    //   console.log("serialport傳送:" + data);
    //   socket.emit("getMessage", "true");
    // });
  });
});
function readData() {
  console.log("-- Connection opened --");
  serialPort.on("data", (data) => {
    let receivedData = convertToString(data, "hex");
    console.log("Data received: " + receivedData); // will remove this line
    // 收到 Buffer data 分析 Query
    let analyzedData = analyzeData(receivedData);
    // 回應 Query
    if (analyzedData === firmataProtocol.REPORT_ANALOG_PIN) {
      writeData(analyzedData, true);
    } else {
      writeData(analyzedData);
    }
  });
}

function writeData(analyzedData, analogFlag) {
  if (analogFlag === true) {
    let reportBufferArray = returnAnalogReportBufData();
    reportBufferArray.forEach(element => {
      serialPort.write(element, (err) => {
        if (err) {
          console.log("Error :" + err.message);
        }
        console.log("msg written :" + convertToString(element,"hex"));
      });
    });

  } else {
    let combinedData = combineSysex(analyzedData);
    let bufferData = convertToBuffer(combinedData, "hex");
    serialPort.write(bufferData, (err) => {
      if (err) {
        console.log("Error :" + err.message);
      }
      console.log("msg written :" + combinedData);
    });
  }

}
/**
 * global recored : pin
 */
let pin;
function analyzeData(receivedData) {
  console.log("receivedData : " + receivedData);
  // disassemble receivedData
  let disassembledData = disassembleSysex(receivedData, pin);
  console.log("disassembledData : " + disassembledData);
  switch (disassembledData) {
    case PROTOCOL_VERSION_QUERY:
      io.sockets.emit("getMessage", "connected");
      return PROTOCOL_VERSION_RESPONSE;
    case FIRMWARE_QUERY:
      return FIRMWARE_RESPONSE;
    case CAPABILITY_QUERY:
      return CAPABILITY_RESPONSE;
    case ANALOG_MAPPING_QUERY:
      return ANALOG_MAPPING_RESPONSE;
    case I2C_CONFIG_QUERY:
      i2cIsOpen = true;
      return "";
    case I2C_WRITE_REQUEST_QUERY:
      // 還沒想到怎麼處理false的狀態
      if (i2cIsOpen === true) {
        return I2C_RESPONCE;
      }
    case firmataProtocol.SET_PIN_MODE:
      console.log("SET_PIN_MODE: " + disassembledData);
      pin = pinMap.get(receivedData.slice(2, 4).toString());
      let pinObject = {
        func: "Led",
        pin: pin,
        mode: receivedData.slice(4, 6).toString(),
      };
      io.sockets.emit("getMessage", pinObject);
      return "";
    case firmataProtocol.DIGITAL_DATA_PORT0:
    case firmataProtocol.DIGITAL_DATA_PORT1:
    case firmataProtocol.ANALOG_IO_MESSAGE:
      // 之後拉出去成一個function
      let LSB = receivedData.slice(2, 4).toString();
      let MSB = receivedData.slice(4, 6).toString();
      console.log("LSB" + LSB);
      console.log("MSB" + MSB);
      LedColorMapping(LSB, MSB)
      return "";
    case firmataProtocol.REPORT_ANALOG_PIN:
      pin = receivedData.slice(3, 4).toString();
      console.log("open the report analog at pin " + pin);
      voltToHex(pin);
      return firmataProtocol.REPORT_ANALOG_PIN;

    default:
      // other buffer message like Led => write to txt
      return FIRMWARE_RESPONSE;
  }
}



// Led blink mapping
function LedColorMapping(LSB, MSB) {
  // digital pin
  let anyNum = ledColorMap.get(pin);
  console.log(anyNum);
  // check pin's buffer
  if (LSB === anyNum[0] && MSB === anyNum[1]) {
    // blink 開啟
    io.sockets.emit("getMessage", { LedControl: "on" });
  } else {
    // blink 關掉
    io.sockets.emit("getMessage", { LedControl: "off" });
  }
  // pwm pin
}
