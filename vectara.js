import { config } from "dotenv";
import { VectaraStore } from "langchain/vectorstores/vectara";
import { Document } from "@langchain/core/documents";
import { v4 as uuidV4 } from "uuid";
import axios from "axios";

config();

const customerId = Number(process.env.VECTARA_CUSTOMER_ID);
const corpusId = Number(process.env.VECTARA_CORPUS_ID);

export const addDocstoVectara = async (docs) => {
  const startTime = Date.now();
  const batchSize = 2;
  const numBatches = Math.ceil(docs.length / batchSize);
  let i;
  try {
    const customerId = Number(process.env.VECTARA_CUSTOMER_ID);
    const corpusId = Number(process.env.VECTARA_CORPUS_ID);
    const apiKey = String(process.env.VECTARA_API_KEY);

    const store = new VectaraStore({
      customerId,
      corpusId,
      apiKey,
      verbose: true,
    });

    let docIds = [];

    console.log("Total docs", docs.length);

    if (Array.isArray(docs)) {
      for (i = 0; i < numBatches; i++) {
        const startIdx = i * batchSize;
        const endIdx = Math.min((i + 1) * batchSize, docs.length);
        const batchDocs = docs.slice(startIdx, endIdx);

        if (!batchDocs || batchDocs.length < 1) return;

        let retryCount = 0;
        let success = false;

        while (!success && retryCount < 5) {
          try {
            const batchDocIds = await store.addDocuments(batchDocs);
            docIds = docIds.concat(batchDocIds);
            success = true;
          } catch (error) {
            console.log(
              `Error occurred in batch ${i + 1}, retrying (${
                retryCount + 1
              }/5):`,
              error.message
            );
            retryCount++;
            await new Promise((resolve) => setTimeout(resolve, 60000)); // 60-second delay
          }
        }

        if (!success) {
          console.log(
            `Failed to add batch ${i + 1} after 5 retries, skipping.`
          );
        }

        // Introduce a delay of 5 seconds between batches
        if (i !== numBatches - 1) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    }

    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000; // Convert to seconds
    console.log(`Total time taken: ${totalTime} seconds`);

    return docIds;
  } catch (error) {
    console.log(error.message);
  }
};

const test = async () => {
  try {
    // Create the Vectara store.
    const store = new VectaraStore({
      customerId: Number(process.env.VECTARA_CUSTOMER_ID),
      corpusId: Number(process.env.VECTARA_CORPUS_ID),
      apiKey: String(process.env.VECTARA_API_KEY),
      verbose: true,
    });

    const docs = [];
    let doc_ids;

    for (let i = 0; i < 2; i++) {
      docs.push(
        new Document({
          pageContent: "Do I dare to eat a peach?",
          metadata: {
            source: "https://www.google.com/",
            loc: { lines: { from: 1, to: 1 } },
            foo: "baz",
          },
        })
      );
    }

    // Add two documents with some metadata.
    if (Array.isArray(docs) && docs.length == 1) {
      doc_ids = await store.addDocuments([docs]);
    } else if (Array.isArray(docs) && docs.length > 1) {
      doc_ids = await store.addDocuments(docs);
    }

    console.log(doc_ids);

    // await store.deleteDocuments(doc_ids);
  } catch (error) {
    console.log(error.message);
  }
};

export class VectaraAPI_Client {
  constructor(customerId, corpusId) {
    this.api_key = process.env.VECTARA_API_KEY;
    this.customerId = customerId;
    this.corpusId = corpusId;
    this.baseUrl = "https://api.vectara.io/v1/index";
    this.headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-api-key": this.api_key,
    };
  }

  async addDocs(docs) {
    const customerId = this.customerId;
    const corpusId = this.corpusId;
    const data = {
      customerId,
      corpusId,
      document: this.prepareDocs(docs),
    };
    const res = await this.callIndexApi(data);
    return res.data;
  }

  async callIndexApi(data) {
    return axios.post(this.baseUrl, data, {
      headers: this.headers,
    });
  }

  prepareDocs(docs) {
    const documentId = uuidV4();
    const doc = docs[0];
    const title = doc.metadata.source;
    const description = doc.metadata.source;
    const section = docs.map((doc, index) => this.prepareSection(doc, index));
    console.log("Sections length: " + section.length);
    return {
      documentId,
      title,
      description,
      section,
    };
  }

  prepareSection(doc, index) {
    const id = index;
    const title = doc.metadata.source;
    const text = doc.pageContent;
    const metadataJson = JSON.stringify(doc.metadata);
    return {
      id,
      title,
      text,
      metadataJson,
    };
  }
}

// const newVClient = new VectaraAPI_Client(customerId, corpusId);
// const test2 = async () => {
//   const docs = await webLoader("https://js.langchain.com/docs/modules/chains/");
//   const data = await newVClient.addDocs(docs);
//   console.log(data);
// };

// test2();
