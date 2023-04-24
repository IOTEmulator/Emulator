var SerialPort = require("serialport");
var port = "COM8";

var serialPort = new SerialPort(port, {
  baudRate: 9600
});
let queryFirmware = 'f079f7';
let capabilities = 'f06bf7';
let analogMappingQuery = 'f069f7';
let I2C_REQUEST = 'f0760100020003000500f7f07601100600f7';
let string2send = "F9 02 05 F0 79 02 05 53 00 74 00 61 00 6E 00 64 00 61 00 72 00 64 00 46 00 69 00 72 00 6D 00 61 00 74 00 61 00 50 00 6C 00 75 00 73 00 2E 00 69 00 6E 00 6F 00 F7"
let stringSend = "F90205F07902055300740061006E0064006100720064004600690072006D0061007400610050006C00750073002E0069006E006F00F7";
let capabilitiesNumber = 'f06c7f7f00010b010101040e7f00010b0101010308040e7f00010b010101040e7f00010b0101010308040e7f00010b0101010308040e7f00010b010101040e7f00010b010101040e7f00010b0101010308040e7f00010b0101010308040e7f00010b0101010308040e7f00010b010101040e7f00010b010101040e7f00010b010101020a040e7f00010b010101020a040e7f00010b010101020a040e7f00010b010101020a040e7f00010b010101020a040e06017f00010b010101020a040e06017ff7';
// 舊的，而且是錯誤的hex
let capabilitiesNumber2 = 'F06C7F7F01B1114E7F01B111384E7F01B1114E7F01B111384E7F01B111384E7F01B1114E7F01B1114E7F01B111384E7F01B111384E7F01B111384E7F01B1114E7F01B1114E7F01B1112A4E7F01B1112A4E7F01B1112A4E7F01B1112A4E7F01B1112A4E617F01B1112A4E617FF7';
// Analog Mapping Query
let analogMappingNumber = 'f06a7f7f7f7f7f7f7f7f7f7f7f7f7f7f000102030405f7';
// I2C reponce
let I2C_Responce = 'f07701000000000000000000000000000000f7';
// 


let reportVersion = "F90205"+capabilitiesNumber;
let string2Buffer = Buffer.from(reportVersion,'hex');
console.log("=====string2Buffer====");
console.log(string2Buffer) 
serialPort.on("open", function() {
  console.log("-- Connection opened --");
  serialPort.on("data", function(data) {
    console.log("Data received: " + data.toString('hex'));
    if(data.toString('hex')==queryFirmware){
      console.log("---queryFirmware time---");
      let firmwareNumber = 'F0790205F7'+capabilitiesNumber;
      let firmwareNumber2buffer = Buffer.from( firmwareNumber,'hex');
      serialPort.write(firmwareNumber2buffer,(err)=>{
        if(err){
          console.log("Error :" + err.message)
        }
        console.log('msg written :'+firmwareNumber2buffer);
      });
    }else if(data.toString('hex')==capabilities){
      console.log("---capabilities time---");
      let capabilitiesNumber2buffer = Buffer.from( capabilitiesNumber,'hex');
      serialPort.write(capabilitiesNumber2buffer,(err)=>{
        if(err){
          console.log("Error :" + err.message)
        }
        console.log('msg written :'+capabilitiesNumber2buffer);
      });
    }else if(data.toString('hex')==analogMappingQuery){
      console.log("---analog mapping query time---");
      let analogMappingNumber2buffer = Buffer.from( analogMappingNumber,'hex');
      serialPort.write(analogMappingNumber2buffer,(err)=>{
        if(err){
          console.log("Error :" + err.message)
        }
        console.log('msg written :'+analogMappingNumber2buffer);
      });
    }else if(data.toString('hex')==I2C_REQUEST){
      console.log("---I2C responce time---");
      let I2C_Responce2buffer = Buffer.from( I2C_Responce,'hex');
      serialPort.write(I2C_Responce2buffer,(err)=>{
        if(err){
          console.log("Error :" + err.message)
        }
        console.log('msg written :'+I2C_Responce2buffer);
      });

    }else{
      console.log("收到: " +data.toString('hex') )
      serialPort.write(string2Buffer,(err)=>{
      if(err){
        console.log("Error :" + err.message)
      }
      console.log('msg written');
     });
    }
    
  });
  // setInterval(()=>{
  //   zeroFn();
  // },5000);
  
});

function zeroFn(){
  let stri = '00000000';
  let string2Buffer2 = Buffer.from(stri,'hex');
  serialPort.write(string2Buffer2,(err)=>{
    if(err){
      console.log("Error :" + err.message)
    }
    console.log('msg written stri');
   });
}