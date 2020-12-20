const { FormRecognizerClient, AzureKeyCredential } = require("@azure/ai-form-recognizer");
let config, client;
const init = function(azure) {
  if (
    azure &&
    azure.recognizer &&
    azure.recognizer.endpoint &&
    azure.recognizer.key
  ) {
    config = azure.recognizer;
    if (!config) {
      logger.error('Could not initialize Azure OCR');
      return;
    }

    client = new FormRecognizerClient(config.endpoint, new AzureKeyCredential(config.key));
    // client.beginRecognizeReceipts
  } else {
    logger.error('Could not initialize Azure OCR');
  }
}, extractReceipt = async function(receiptStream) {
  const poller = await client.beginRecognizeReceipts(receiptStream, {
    contentType: "image/jpeg",
    onProgress: (state) => {
      console.log(`status: ${state.status}`);
    }
  });

  const receipts = await poller.pollUntilDone();

  if (!receipts || receipts.length <= 0) {
    throw new Error("Expecting at lease one receipt in analysis result");
  }

  const receipt = receipts[0];
  console.log("First receipt:", JSON.stringify(receipt));
  const receiptTypeField = receipt.fields["ReceiptType"];
  if (receiptTypeField.valueType === "string") {
    console.log(
      `  Receipt Type: '${receiptTypeField.value || "<missing>"}', with confidence of ${
        receiptTypeField.confidence
      }`
    );
  }
  const merchantNameField = receipt.fields["MerchantName"];
  if (merchantNameField.valueType === "string") {
    console.log(
      `  Merchant Name: '${merchantNameField.value || "<missing>"}', with confidence of ${
        merchantNameField.confidence
      }`
    );
  }
  const transactionDate = receipt.fields["TransactionDate"];
  if (transactionDate && transactionDate.valueType === "date") {
    console.log(
      `  Transaction Date: '${transactionDate.value || "<missing>"}', with confidence of ${
        transactionDate.confidence
      }`
    );
  }
  const itemsField = receipt.fields["Items"];
  if (itemsField && itemsField.valueType === "array") {
    for (const itemField of itemsField.value || []) {
      if (itemField.valueType === "object") {
        const itemNameField = itemField.value["Name"];
        if (itemNameField && itemNameField.valueType === "string") {
          console.log(
            `    Item Name: '${itemNameField.value || "<missing>"}', with confidence of ${
              itemNameField.confidence
            }`
          );
        }
      }
    }
  }
  const totalField = receipt.fields["Total"];
  if (totalField && totalField.valueType === "number") {
    console.log(
      `  Total: '${totalField.value || "<missing>"}', with confidence of ${totalField.confidence}`
    );
  }
};

export {init, extractReceipt};