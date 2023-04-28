this.transport.on("data", data => {
    console.log("=========this.transport on data=======")
    for (let i = 0; i < data.length; i++) {
      let byte = data[i];
      // we dont want to push 0 as the first byte on our buffer
      if (this.buffer.length === 0 && byte === 0) {
        continue;
      } else {
        this.buffer.push(byte);

        let first = this.buffer[0];
        let last = this.buffer[this.buffer.length - 1];
        // [START_SYSEX, ... END_SYSEX]
        if (first === START_SYSEX && last === END_SYSEX) {

          let handler = SYSEX_RESPONSE[this.buffer[1]];
          console.log("handler : " + this.buffer[1]);
          console.log(byte);
          if(this.buffer[1]===108){
            let hexArray = [];
            for(let i = 0 ; i< this.buffer.length ; i++){
              hexArray.push(this.buffer[i].toString(16).toUpperCase());
            }
            console.log("===================Capability Query F06BF7 =================");
            fs.writeFile('C:/Users/520hi/BufferFile/Test/TestRead.txt',hexArray.toString(),(err)=>{
              if(err){
                console.log("errr: " + err);
              }else{
                console.log("Capability Query txt complete.");
              }
            })
          }
          // Ensure a valid SYSEX_RESPONSE handler exists
          // Only process these AFTER the REPORT_VERSION
          // message has been received and processed.
          if (handler && this.versionReceived) {
            handler(this);
          }

          // It is possible for the board to have
          // existing activity from a previous run
          // that will leave any of the following
          // active:
          //
          //    - ANALOG_MESSAGE
          //    - SERIAL_READ
          //    - I2C_REQUEST, CONTINUOUS_READ
          //
          // This means that we will receive these
          // messages on transport "open", before any
          // handshake can occur. We MUST assert
          // that we will only process this buffer
          // AFTER the REPORT_VERSION message has
          // been received. Not doing so will result
          // in the appearance of the program "hanging".
          //
          // Since we cannot do anything with this data
          // until _after_ REPORT_VERSION, discard it.
          //
          this.buffer.length = 0;

        } else if (first === START_SYSEX && (this.buffer.length > 0)) {
          // we have a new command after an incomplete sysex command
          let currByte = data[i];
          if (currByte > 0x7F) {
            this.buffer.length = 0;
            this.buffer.push(currByte);
          }
        } else {
          /* istanbul ignore else */
          if (first !== START_SYSEX) {
            // Check if data gets out of sync: first byte in buffer
            // must be a valid response if not START_SYSEX
            // Identify response on first byte
            let response = first < START_SYSEX ? (first & START_SYSEX) : first;

            // Check if the first byte is possibly
            // a valid MIDI_RESPONSE (handler)
            /* istanbul ignore else */
            if (response !== REPORT_VERSION &&
                response !== ANALOG_MESSAGE &&
                response !== DIGITAL_MESSAGE) {
              // If not valid, then we received garbage and can discard
              // whatever bytes have been been queued.
              this.buffer.length = 0;
            }
          }
        }

        // There are 3 bytes in the buffer and the first is not START_SYSEX:
        // Might have a MIDI Command
        if (this.buffer.length === 3 && first !== START_SYSEX) {
          // response bytes under 0xF0 we have a multi byte operation
          let response = first < START_SYSEX ? (first & START_SYSEX) : first;

          /* istanbul ignore else */
          if (MIDI_RESPONSE[response]) {
            // It's ok that this.versionReceived will be set to
            // true every time a valid MIDI_RESPONSE is received.
            // This condition is necessary to ensure that REPORT_VERSION
            // is called first.
            if (this.versionReceived || first === REPORT_VERSION) {
              this.versionReceived = true;
              MIDI_RESPONSE[response](this);
            }
            this.buffer.length = 0;
          } else {
            // A bad serial read must have happened.
            // Reseting the buffer will allow recovery.
            this.buffer.length = 0;
          }
        }
      }
    }
  });