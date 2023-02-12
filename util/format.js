// Define Firmata SYSEX Command
const START_SYSEX = 'f0';
const END_SYSEX = 'f7';
const PROTOCOL_VERSION_RESPONSE = 'f90205';

// convert hex format to Buffer
function convertToBuffer(sysex , format){
    return Buffer.from(sysex,format);
}

// convert serialport read data to string 'hex'
function convertToString(data , format){
    return data.toString(format);
}

// combine Firmata sysex command start'F0' & end 'F7'
function combineSysex(sysex){
    // exclude report version command (F90205)
    if(sysex !== PROTOCOL_VERSION_RESPONSE){
        return START_SYSEX + sysex + END_SYSEX;
    }else{
        return sysex;
    }
} 

// disassemble sysex start & end command
function disassembleSysex(sysex){
    if(sysex.slice(0,2)===START_SYSEX){
        return sysex.slice(2,4).toString();
    }else{
        return sysex.toString();
    }
}


module.exports = {convertToBuffer , convertToString , combineSysex , disassembleSysex};