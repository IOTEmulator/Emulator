const ledColorMap = new Map([
  ["0", ["01", "00"]],
  ["1", ["02", "00"]],
  ["2", ["04", "00"]],
  ["3", ["7f", "01"]],
  ["4", ["10", "00"]],
  ["5", ["7f", "01"]],
  ["6", ["7f", "01"]],
  ["7", ["00", "01"]],
  ["8", ["01", "00"]],
  ["9", ["7f", "01"]],
  ["10", ["7f", "01"]],
  ["11", ["7f", "01"]],
  ["12", ["10", "00"]],
  ["13", ["20", "00"]],
  ["A0", ["40", "00"]],
  ["A1", ["00", "01"]],
  ["A2", ["01", "00"]],
  ["A3", ["02", "00"]],
  ["A4", ["04", "00"]],
  ["A5", ["08", "00"]],
]);
// 用在Buffer過來
let pinMap = new Map([
  ["00", "0"],
  ["01", "1"],
  ["02", "2"],
  ["03", "3"],
  ["04", "4"],
  ["05", "5"],
  ["06", "6"],
  ["07", "7"],
  ["08", "8"],
  ["09", "9"],
  ["0a", "10"],
  ["0b", "11"],
  ["0c", "12"],
  ["0d", "13"],
  ["0e", "A0"],
  ["0f", "A1"],
  ["10", "A2"],
  ["11", "A3"],
  ["12", "A4"],
  ["13", "A5"],
]);

// digital read : click btn event msg mapping
const btnClickMap = new Map([
  ["2", ["04", "00"]],
  ["3", ["08", "01"]],
  ["4", ["10", "00"]],
  ["5", ["20", "0"]],
  ["6", ["40", "00"]],
  ["7", ["00", "01"]],
  ["8", ["01", "00"]],
  ["9", ["02", "00"]],
  ["10", ["04", "00"]],
  ["11", ["08", "00"]],
  ["12", ["10", "00"]],
  ["13", ["20", "00"]],
  ["A0", ["40", "00"]],
  ["A1", ["00", "01"]],
  ["A2", ["01", "00"]],
  ["A3", ["02", "00"]],
  ["A4", ["04", "00"]],
  ["A5", ["08", "00"]],
  ["14", ["40", "00"]],
  ["15", ["00", "01"]],
  ["16", ["01", "00"]],
  ["17", ["02", "00"]],
  ["18", ["04", "00"]],
  ["19", ["08", "00"]],
]);

// 一個port，8個pin
const portMap = new Map([
  ["0", "0"],
  ["1", "0"],
  ["2", "0"],
  ["3", "0"],
  ["4", "0"],
  ["5", "0"],
  ["6", "0"],
  ["7", "0"],
  ["8", "1"],
  ["9", "1"],
  ["10", "1"],
  ["11", "1"],
  ["12", "1"],
  ["13", "1"],
  ["A0", "1"],
  ["A1", "1"],
  ["A2", "2"],
  ["A3", "2"],
  ["A4", "2"],
  ["A5", "2"],
  ["14", "1"],
  ["15", "1"],
  ["16", "2"],
  ["17", "2"],
  ["18", "2"],
  ["19", "2"],
]);

const CELSIUS_TO_KELVIN = 273.15;
const MODES = {
  INPUT: "00",
  OUTPUT: "01",
  ANALOG: "02",
  PWM: "03",
  SERVO: "04",
};

module.exports = {
  ledColorMap,
  pinMap,
  CELSIUS_TO_KELVIN,
  portMap,
  btnClickMap,
  MODES,
};
