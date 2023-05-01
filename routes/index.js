const express = require("express");
let router = express.Router();
const bindingPort = "COM222";
// Dependencies SerialPort ^9.0.2
const SerialPort = require("serialport");
let serialPort = new SerialPort(bindingPort, {
  baudRate: 57600,
});
// import setting.json
const SETTING = require("../config/setting.json");
// import write data function
let { clickButton } = require("../util/event");

function write(analyzedData, analogFlag, eventName) {
  serialPort.write(analyzedData, (err) => {
    if (err) {
      console.log("Error :" + err.message);
      return 400;
    } else {
      console.log(analyzedData.toString());
      return 200;
    }
  });
}

/* GET digital write status. */
router.get("/digitalwrite", function (req, res) {
  res.status(200).json({ digitalwrite: true });
});

/* GET analog write status. */
// 螢幕亮度的調光、LED 連續亮度\的調整、喇叭音量大小的控制
router.get("/analogwrite", function (req, res) {
  res.status(200).json({ analogwrite: true });
});

/* GET digital read status. */
// click digital button
router.get("/digitalread", function (req, res) {
  res.status(200).json({ digitalread: true });
});

/* POST : user post this api to emulate clicking button. */
router.post("/clickbutton", async (req, res, next) => {
  console.log(req.body);
  let pin = req.body.pin;
  console.log(pin);
  let dataToTransport = clickButton(pin);
  let status = write(dataToTransport, false, "clickbutton");
  if (status === 200) {
    res.status(200).json({ clickbutton: "success" });
  } else {
    res.status(400).json({ clickbutton: "fail" });
  }
});
/* GET analog read status. */
// read setting json file
router.get("/analogread", function (req, res) {
  res.status(200).json({ analogread: SETTING.thermometer });
});

module.exports = router;
