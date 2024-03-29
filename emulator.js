const express = require("express");
const app = express();
let cors = require("cors");
app.use(cors());
let path = require("path");
let cookieParser = require("cookie-parser");
let logger = require("morgan");
const bodyParser = require("body-parser");

// 用於引入.env檔案的模組
require('dotenv').config();

// let indexRouter = require("./routes/index");
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

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
  voltToHex,
  returnAnalogReportBufData,
} = require("./util/format");

// Firmata Protocol Format
const firmataProtocol = require("./protocol/protocol");

// Dependencies SerialPort ^9.0.2
const SerialPort = require("serialport");

// get mapping data
const { ledColorMap, pinMap, portMap, MODES } = require("./mapping/mapping");

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

const bindingPort = process.env.BINDINGPORT;

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
    console.log(new Date().getTime());
    let receivedData = convertToString(data, "hex");
    // console.log("Data received: " + receivedData); // will remove this line
    // 收到 Buffer data 分析 Query
    let analyzedData = analyzeData(receivedData);
    // 回應 Query
    if (
      analyzedData === firmataProtocol.REPORT_ANALOG_PIN
    ) {
      writeData(analyzedData, true);
    } else if (analyzedData === firmataProtocol.REPORT_DIGITAL_PORT) {
      // writeData(analyzedData, true, "clickButton");
    } else {
      writeData(analyzedData);
    }
  });
}

async function writeData(analyzedData, analogFlag, eventName) {
  // 先這樣寫判斷api事件
  // switch (eventName) {
  //   case "clickButton":
  //     serialPort.write(analyzedData, (err) => {
  //       if (err) {
  //         console.log("Error :" + err.message);
  //         return 400;
  //       } else {
  //         console.log(analyzedData.toString());
  //         return 200;
  //       }
  //     });
  //     break;
  //   default:
  //     break;
  // }
  if (eventName === "clickButton") {
    console.log("writeData : 1");
    let status;
    let dataToTransport = clickButton(pin);
    await writeSerialData(dataToTransport);
    // serialPort.write(analyzedData, (err) => {
    //   if (err) {
    //     console.log("Error :" + err.message);
    //     return 400;
    //   } else {
    //     console.log(analyzedData.toString("hex"));
    //     return 200;
    //   }
    // });
  } else if (analogFlag === true) {
    console.log("writeData : 2");
    let reportBufferArray = returnAnalogReportBufData();
    let i = 0;
    let interval = setInterval(function () {
      if (i >= reportBufferArray.length) {
        clearInterval(interval);
        return;
      }
      serialPort.write(reportBufferArray[i], (err) => {
        if (err) {
          console.log("Error :" + err.message);
        }
      });
      console.log(
        "mgs write : " + convertToString(reportBufferArray[i], "hex")
      );
      i++;
    }, 1);
  } else {
    console.log("writeData : 3");
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
let pinHex;
let pin;
let mode;
let port;
// local app data
app.locals.ledstatus = "off";
app.locals.LSB;
app.locals.MSB;
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
      mode = receivedData.slice(4, 6).toString();
      pinHex = receivedData.slice(2, 4).toString();
      pin = pinMap.get(receivedData.slice(2, 4).toString());
      console.log("pinHex : " + pinHex);
      console.log("pin : " + pin);
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
      app.locals.LSB = receivedData.slice(2, 4).toString();
      app.locals.MSB = receivedData.slice(4, 6).toString();
      // console.log("LSB" + app.locals.LSB);
      // console.log("MSB" + app.locals.MSB);
      if (mode === MODES.PWM) {
        controlLedBrightness(app.locals.LSB, app.locals.MSB);
      } else {
        LedColorMapping(app.locals.LSB, app.locals.MSB);
      }
      return "";
    case firmataProtocol.REPORT_ANALOG_PIN:
      pin = receivedData.slice(1, 2).toString();
      console.log("open the report analog at pin " + pin);
      voltToHex(pin);
      return firmataProtocol.REPORT_ANALOG_PIN;

    case firmataProtocol.REPORT_DIGITAL_PORT: // 0xD_port
      port = portMap.get(pin);

      return firmataProtocol.REPORT_DIGITAL_PORT;

    default:
      // other buffer message like Led => write to txt
      return FIRMWARE_RESPONSE;
  }
}

// Led blink mapping
function LedColorMapping(LSB, MSB) {
  // digital pin
  let anyNum = ledColorMap.get(pin);
  // console.log(anyNum);
  // check pin's buffer
  if (LSB === anyNum[0] && MSB === anyNum[1]) {
    // blink 開啟
    io.sockets.emit("getMessage", { LedControl: "on" });
    app.locals.ledstatus = "on";
    console.log("on");
  } else {
    // blink 關掉
    io.sockets.emit("getMessage", { LedControl: "off" });
    app.locals.ledstatus = "off";
    console.log("off");
  }
  // pwm pin
}

/**
 * API
 */
// import write data function
let { clickButton, controlLedBrightness } = require("./util/event");

/* GET digital write status. */
app.get("/ledstatus", (req, res) => {
  console.log("your led status : " + app.locals.ledstatus);
  res.status(200).json({ "your led status": app.locals.ledstatus });
});

/* GET analog write status. */
// 螢幕亮度的調光、LED 連續亮度\的調整、喇叭音量大小的控制
app.get("/analogwrite", function (req, res) {
  res.status(200).json({ analogwrite: true });
});

/* GET digital read status. */
// click digital button
app.get("/digitalread", function (req, res) {
  res.status(200).json({ digitalread: true });
});
/**
 * GET : (for J5 analog write)
 */
app.get("/brightness", async function (req, res) {
  // 處理使用者輸入亮度 0-255
  let value = controlLedBrightness(pinHex, app.locals.LSB, app.locals.MSB);
  console.log(value);
  try {
    res.status(200).json({ brightness: value });
  } catch (error) {
    res.status(400).json({ brightness: "fail" });
  }
});
/* PUT : user PUT this api to emulate clicking button. (for J5 digital read) */
app.put("/clickbutton/:pin_number/:status", async (req, res, next) => {
  console.log("put /c");
  console.log("pin number : " + req.params.pin_number);
  console.log("button status : " + req.params.status);
  let pin = req.params.pin_number;
  let status = req.params.status;
  if (pin > 19 || pin < 0) {
    res.status(200).json({ success: false });
  } else {
    try {
      let dataToTransport = clickButton(pin, status);
      console.log("await for Promise");
      await writeSerialData(dataToTransport);
      console.log("Promise success");
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(400);
    }
  }
});

/* GET analog read status. */
// read setting json file
app.post("/thermometer", function (req, res) {
  res.status(200).json({ thermometer: SETTING.thermometer });
});

function writeSerialData(data) {
  return new Promise((resolve, reject) => {
    serialPort.write(data, (error) => {
      console.log(data);
      console.log(new Date().getTime());
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
