const fs = require("fs");
// firmata protocol format
const firmataProtocol = require("../protocol/protocol");
// Define Firmata SYSEX Command
const START_SYSEX = "f0";
const END_SYSEX = "f7";
const PROTOCOL_VERSION_RESPONSE = "f90205";

// convert hex format to Buffer
function convertToBuffer(sysex, format) {
  return Buffer.from(sysex, format);
}

// convert serialport read data to string 'hex'
function convertToString(data, format) {
  return data.toString(format);
}

// combine Firmata sysex command start'F0' & end 'F7'
function combineSysex(sysex) {
  // exclude report version command (F90205)
  if (sysex !== PROTOCOL_VERSION_RESPONSE) {
    return START_SYSEX + sysex + END_SYSEX;
  } else {
    return sysex;
  }
}

// disassemble sysex start & end command & any command
function disassembleSysex(sysex) {
  if (sysex.slice(0, 2) === START_SYSEX) {
    return sysex.slice(2, 4).toString();
  } else if (sysex.slice(0, 2) === firmataProtocol.SET_PIN_MODE) {
    // 先假設只有pin 0腳位的情況回傳的資訊
    return sysex.slice(0, 2).toString();
  } else if (
    sysex.slice(0, 2) === firmataProtocol.DIGITAL_DATA_PORT0 ||
    sysex.slice(0, 2) === firmataProtocol.DIGITAL_DATA_PORT1
  ) {
    return sysex.slice(0, 2).toString();
  } else {
    return sysex.toString();
  }
}

// temp write buffer message to txt
function writeToFile(sysex) {
  let emulatorBufferFilePath =
    "C:/Users/11146/OneDrive/桌面/emulatorReceiveFile/LedTime.txt";
  fs.appendFile(emulatorBufferFilePath, sysex, (err) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log("Led 13 file append complete.");
    }
  });
}

module.exports = {
  convertToBuffer,
  convertToString,
  combineSysex,
  disassembleSysex,
  writeToFile,
};
