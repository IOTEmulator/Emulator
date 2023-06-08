const fs = require("fs");
// firmata protocol format
const firmataProtocol = require("../protocol/protocol");
//
const SETTING = require("../config/setting.json");
//
const CELSIUS_TO_KELVIN = require("../mapping/mapping");

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
  // 處理一串資料直接進來
  // let leng = sysex.length;
  // let returnArray =[];
  // console.log(sysex.length);
  // if(leng > 6 ){
  //   // 分解成6個一組
  //   let sysexCount = leng / 6;
  //   return 
  // }else{

  // }
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
  } else if (sysex.slice(0, 1) === firmataProtocol.REPORT_DIGITAL_PORT) {
    return firmataProtocol.REPORT_DIGITAL_PORT;
  } else {
    return sysex.toString();
  }
}

/**
 * User uses setting json file for testing
 * This function tranforms true raw celsius to Hex code,
 * and push data to return buffer array.
 */
let returnArray = [];
function voltToHex(pin) {
  returnArray = [];
  // raw celsius
  let rawArray = SETTING.thermometer.data;
  rawArray.forEach((raw) => {
    // match controller
    let conntroller = SETTING.thermometer.controller;
    let voltRAw;
    switch (conntroller) {
      case "LM35":
        // c -> volt raw -> buffer hex
        voltRAw = (raw * 1023) / (100 * 5); // r
        break;
      case "LM335":
        voltRAw = (raw * 1023) / (100 * 5) + CELSIUS_TO_KELVIN; // r
        break;
      case "TMP36":
        voltRAw = (raw * 1023) / (100 * 5) + 50;
        break;
      default:
        // LM35
        voltRAw = (raw * 1023) / (100 * 5); // r
        break;
    }
    let tempB = Math.round(voltRAw).toString(16);
    // returnArray.push(Buffer.from([`0x${tempB}`, "0x00", `0xe${pin}`]));
    returnArray.push(Buffer.from([ `0xe${pin}`,`0x${tempB}`,"0x00"]));
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
  voltToHex,
  returnAnalogReportBufData,
};
