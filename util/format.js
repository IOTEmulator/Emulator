const fs = require("fs");
// firmata protocol format
const firmataProtocol = require("../protocol/protocol");
// 
const SETTING = require("../config/setting.json");

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
function disassembleSysex(sysex, pin) {
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
  } else if (sysex.slice(0, 1) === firmataProtocol.ANALOG_IO_MESSAGE) {
    if (pin != undefined) {
      return firmataProtocol.ANALOG_IO_MESSAGE;
    }
  } else if (sysex.slice(0, 1) === firmataProtocol.REPORT_ANALOG_PIN) {
    return firmataProtocol.REPORT_ANALOG_PIN;
  }
  else {
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

/**
 * User uses setting json file for testing
 * This function tranforms true raw celsius to Hex code,  
 * and push data to return buffer array.
 */
let returnArray = [];
function voltToHex(pin) {
  // raw celsius
  let rawArray = SETTING.thermometer;
  rawArray.forEach((raw) => {
    let tempB = raw.toString(16);
    returnArray.push(Buffer.from([`0x${tempB}`, '0x00', `0xe${pin}`]));
  });
  console.log(returnArray);
}

/**
 * Return the analog report buffer data array.
 */
function returnAnalogReportBufData() {
  return returnArray;
}

module.exports = {
  convertToBuffer,
  convertToString,
  combineSysex,
  disassembleSysex,
  writeToFile,
  voltToHex,
  returnAnalogReportBufData
};
