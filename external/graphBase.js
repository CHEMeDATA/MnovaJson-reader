// Comment /un comment last line for mode/Browser usage 
 
 class GraphBase {
  constructor(name, options = {}) {
    // Initialize core properties
    this.name = name;

    // Save the entire options object
    this.options = options;

    // Handle options with defaults
    this.dataTypesSend = options.dataTypesSend || [];
    this.dataTypesReceive = options.dataTypesReceive || [];
    this.logAllDataExchange =
      options.logAllDataExchange !== undefined
        ? options.logAllDataExchange
        : true;

    this.receivers = []; // To store registered receivers
    this.receptionLog = []; // To store reception details
  }

  generateHashCode() {
    return Math.random().toString(36).substring(2, 6); // Generate a 4-character hash
  }

  sendData(type, inContent = []) {
    const sourceName = this.name;
    const dataToSend = {
      type: type,
      text: `${type} from ${this.name}`,
      name: this.name,
      hashCode: this.generateHashCode(),
      content: inContent,
    };
    this.receivers.forEach(({ receiver, dataType }) => {
      if (dataToSend.type === dataType) {
        console.log(
          'sendData ',
          dataType,
          ' from ',
          sourceName,
          ' to ',
          receiver,
        );
        receiver.receiveData(dataToSend, this.name);
      }
    });
  }

  receiveData(data, sender) {
    const receptionTime = new Date().toISOString();
    console.log(`${this.name} received from ${sender}:`, data);

    // Store the reception details
    if (this.logAllDataExchange) {
      this.receptionLog.push({
        hashCode: data.hashCode,
        time: receptionTime,
        text: data.text,
        typeMessage: 'receiveData',
      });
    }

    const updateFunctionName = data.type + '_UpdateFunction';
    let updateResult;
    if (typeof this[updateFunctionName] === 'function') {
      updateResult = this[updateFunctionName](data, sender);
    } else {
      console.log(
        `The member function ${updateFunctionName} does not exists. Save data as ${data.type} to this.`,
      );

      // Store the received data, replacing any existing data for this data type
      this[data.type] = data.content;
      /* For storage as an array (good for full log)
      // Dynamically create a new property if it doesn't exist, based on the data type
      const dataTypeKey = data.type + '_array';
      if (!this.hasOwnProperty(dataTypeKey)) {
        this[dataTypeKey] = []; // Initialize the property as an array
      }

      // Store the received data and origin in the newly created or existing property
      this[dataTypeKey].push({
        data: data.content, // Store the entire data object
        origin: sender, // Store the sender's information
        time: receptionTime, // Store the reception time
      });
	  */
    }

    // Send a reply only to the initial sender with the same hashCode
    const replyData = {
      type: data.type,
      name: this.name,
      text: `${this.name}'s response to ${data.type}`,
      hashCode: data.hashCode, // Use the same hashCode as received
      content: updateResult,
    };
    this.sendReply(replyData, sender);
  }

  sendReply(data, originalSender) {
    // Find the original sender in the receivers list and send the reply only to them
    const receiverEntry = this.receivers.find(
      ({ receiver }) => receiver.name === originalSender,
    );

    if (receiverEntry) {
      receiverEntry.receiver.receiveResponse(data, this.name);
    }
  }

  receiveResponse(data, sender) {
    const receptionTime = new Date().toISOString();
    console.log(`${this.name} received response from ${sender}:`, data);

    if (data.content != null) {
      const updateFunctionName = data.type + '_UpdateFunctionResponse';

      if (typeof this[updateFunctionName] === 'function') {
        this[updateFunctionName](data, sender);
      } else {
        const dataTypeReturn = data.type + '_DefaultSave_Returned';
        console.log(
          `The member function ${updateFunctionName} does not exists. Save data as ${dataTypeReturn} to this`,
        );

        // Store the received data, replacing any existing data for this data type
        this[dataTypeReturn] = data.content;
      }
    }
    // Store the reception details for the response
    if (this.logAllDataExchange) {
      this.receptionLog.push({
        hashCode: data.hashCode,
        time: receptionTime,
        text: data.text,
        typeMessage: 'returnData',
      });
    }
  }

  getExportTypes() {
    return this.dataTypesSend;
  }

  getImportTypes() {
    return this.dataTypesReceive;
  }

  registerReceiver(receiver, dataType) {
    console.log(
      this.name,
      ' registers data type ',
      dataType,
      ' for class ',
      receiver.name,
    );
    this.receivers.push({ receiver, dataType }); // Register each receiver with its data type
  }

  triggerWindow(content) {
    const type = 'windowData';
    console.log(`${this.name} triggered a ${type} event.`);
    this.sendData(type, content);
  }

  windowData_UpdateFunction(data, sender) {
    console.log(this.name, '-----_windowDataUpdateFunction > data :', data);
    console.log(
      this.name,
      '-----_windowDataUpdateFunction > data.content :',
      data.content,
      ' sender ',
      sender,
    );

    // store in array...
    const dataTypeKey = data.type + '_array';
    if (!this.hasOwnProperty(dataTypeKey)) {
      this[dataTypeKey] = []; // Initialize the property as an array
    }
    const receptionTime = new Date().toISOString();

    // Store the received data and origin in the newly created or existing property
    this[dataTypeKey].push({
      type: data.type, // Store the entire data object
      data: data.content, // Store the entire data object
      origin: sender, // Store the sender's information
      time: receptionTime, // Store the reception time
    });

    const inContent = { returnedData: 155, ffd: 33, reception : "OK" };

    return inContent;
  }
  windowData_UpdateFunctionResponse(data, sender) {
    console.log(
      this.name,
      '-----_windowData_UpdateFunctionReturn > data :',
      data,
    );

    // this.savedBy_windowData_UpdateFunctionReturn = data;
    // store in array...
    const dataTypeKey = data.type + '_array_returned';
    if (!this.hasOwnProperty(dataTypeKey)) {
      this[dataTypeKey] = []; // Initialize the property as an array
    }
    const receptionTime = new Date().toISOString();

    // Store the received data and origin in the newly created or existing property
    this[dataTypeKey].push({
      type: data.type, // Store the entire data object
      data: data.content, // Store the entire data object
      origin: sender, // Store the sender's information
      time: receptionTime, // Store the reception time
    });
  }
}

// CommonJS export (for Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GraphBase };
} 

// ES Module export (for browser)
// UNCOMMENT FOR NODE
export { GraphBase };