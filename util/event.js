const { btnClickMap, portMap } = require("../mapping/mapping");

/**
 * Return the digital report buffer data array.
 */
function clickButton(pin) {
  let digitalData = btnClickMap.get(pin);
  let portNumber = portMap.get(pin);
  // 9x[0][1]
  let dataToTransport = Buffer.from([
    `0x9${portNumber}`,
    `0x${digitalData[0]}`,
    `0x${digitalData[1]}`,
  ]);
  return dataToTransport;
}
/**
 * Return the digital write result buffer data array.
 */
// function
module.exports = { clickButton };
