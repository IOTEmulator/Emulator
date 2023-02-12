// import util common module
const {convertToBuffer , convertToString , combineSysex , disassembleSysex} = require('./util/format');

// Dependencies SerialPort ^9.0.2
const SerialPort = require('serialport');

/**
 * Firmata Protocol Query Hex Constants
 */
const PROTOCOL_VERSION_QUERY = 'f9';
const FIRMWARE_QUERY = '79';
const CAPABILITY_QUERY = '6b';
const ANALOG_MAPPING_QUERY = '69';
// i2c (see https://github.com/firmata/protocol/blob/master/i2c.md) 
// This must be called prior to any I2C reads or writes
const I2C_CONFIG_QUERY = '78';
const I2C_WRITE_REQUEST_QUERY = '76'; //+'0100020003000500f7f07601100600';

/**
 * Firmata Protocol Responce Hex Constants
 */

// firmata protocol version
const PROTOCOL_VERSION_RESPONSE = 'f90205';
const FIRMWARE_RESPONSE = '79'+'0205'; // same as query lol
const CAPABILITY_RESPONSE = '6c'+'6c7f7f00010b010101040e7f00010b0101010308040e7f00010b010101040e7f00010b0101010308040e7f00010b0101010308040e7f00010b010101040e7f00010b010101040e7f00010b0101010308040e7f00010b0101010308040e7f00010b0101010308040e7f00010b010101040e7f00010b010101040e7f00010b010101020a040e7f00010b010101020a040e7f00010b010101020a040e7f00010b010101020a040e7f00010b010101020a040e06017f00010b010101020a040e06017f';
const ANALOG_MAPPING_RESPONSE = '6a'+'7f7f7f7f7f7f7f7f7f7f7f7f7f7f000102030405';
const I2C_RESPONCE = '77'+'01000000000000000000000000000000';

/**
 * I2C toggle 
 */
let i2cIsOpen = false;

/**
 * serialport open, connect, waiting for data, write data to Johnny-five. 
 *
 */

const bindingPort = 'COM5';

let serialPort = new SerialPort(bindingPort,{
    baudRate: 9600
});

serialPort.on("open",()=>readData());


function readData(){
  console.log("-- Connection opened --");
  serialPort.on("data", (data) =>{
    let receivedData = convertToString(data,'hex'); 
    // console.log("Data received: " + receivedData); // will remove this line
    // 收到 Buffer data 分析 Query
    let analyzedData = analyzeData(receivedData);
    // 回應 Query
    writeData(analyzedData);
  });
}

function writeData(analyzedData){
  let combinedData =  combineSysex(analyzedData);
  let bufferData = convertToBuffer(combinedData,'hex');
  serialPort.write(bufferData,(err)=>{
    if(err){
      console.log("Error :" + err.message);
    }
    console.log('msg written :'+combinedData);
  });
}

function analyzeData(receivedData){
  // disassemble receivedData
  let disassembledData  = disassembleSysex(receivedData);
  // console.log("disassembledData : " + disassembledData);
  switch(disassembledData){
    case PROTOCOL_VERSION_QUERY:
      return PROTOCOL_VERSION_RESPONSE;
    case FIRMWARE_QUERY:
      return FIRMWARE_RESPONSE;
    case CAPABILITY_QUERY:
      return CAPABILITY_RESPONSE;
    case ANALOG_MAPPING_QUERY:
      return ANALOG_MAPPING_RESPONSE;
    case I2C_CONFIG_QUERY:
      i2cIsOpen = true;
      return '';
    case I2C_WRITE_REQUEST_QUERY:
      // 還沒想到怎麼處理false的狀態
      if(i2cIsOpen === true){
        return I2C_RESPONCE;
      }
    default:
      return FIRMWARE_RESPONSE;
  }
}


