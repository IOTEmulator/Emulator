function writeData(analyzedData, analogFlag) {
  if (analogFlag === true) {
    let reportBufferArray = returnAnalogReportBufData();
    let i = 0;
    let interval = setInterval(function () {
      if (i >= reportBufferArray.length) {
        clearInterval(interval);
        return;
      }
      serialPort.write(reportBufferArray[i], (err) => {
        if (err) {
          console.log("Error :" + err.message);
        }
      });
      console.log(
        "mgs write : " + convertToString(reportBufferArray[i], "hex")
      );
      i++;
    }, 200);
  } else {
    let combinedData = combineSysex(analyzedData);
    let bufferData = convertToBuffer(combinedData, "hex");
    serialPort.write(bufferData, (err) => {
      if (err) {
        console.log("Error :" + err.message);
      }
      console.log("msg written :" + combinedData);
    });
  }
}
