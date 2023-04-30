const firmataProtocol = {
  SET_PIN_MODE: "f4",
  DIGITAL_DATA_PORT0: "90",
  DIGITAL_DATA_PORT1: "91",
  ANALOG_IO_MESSAGE: "e",
  REPORT_ANALOG_PIN: "c", // 0xc0 pin# means disable the report function
  REPORT_DIGITAL_PORT: "d"
};

module.exports = firmataProtocol;
