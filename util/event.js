const { btnClickMap, portMap } = require("../mapping/mapping");

/**
 * Return the digital report buffer data array.
 */
function clickButton(pin, status) {
  let digitalData = btnClickMap.get(pin);
  let portNumber = portMap.get(pin);
  let dataToTransport;
  if (status === "on") {
    // 9x[0][1]
    dataToTransport = Buffer.from([
      `0x9${portNumber}`,
      `0x${digitalData[0]}`,
      `0x${digitalData[1]}`,
    ]);
  } else {
    // 9x[0][0]
    dataToTransport = Buffer.from([
      `0x9${portNumber}`,
      `0x${digitalData[1]}`,
      `0x${digitalData[1]}`,
    ]);
  }
  return dataToTransport;
}
/**
 * Return the analog write result buffer data array.
 */
function controlLedBrightness(pinHex, LSB, MSB) {
  let returnVal;
  if (MSB === "00") {
    // 0-127
    returnVal = parseInt(LSB, 16);
  } else {
    // 128-255
    returnVal = parseInt(LSB, 16) + 128;
  }

  return returnVal;
}
module.exports = { clickButton, controlLedBrightness };
