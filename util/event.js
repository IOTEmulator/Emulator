const { btnClickMap, portMap } = require("../mapping/mapping");

/**
 * Return the digital report buffer data array.
 */
function clickButton(pin) {
  let digitalData = btnClickMap.get(pin);
  let portNumber = portMap.get(pin);
  let dataToTransport = Buffer.from([
    `0x${digitalData[0]}`,
    `0x${digitalData[1]}`,
    `0x9${portNumber}`,
  ]);
  return dataToTransport;
}

module.exports = { clickButton };
