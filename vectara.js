import { config } from "dotenv";

config();

export const addDocstoVectara = async (docs) => {
  const customerId = Number(process.env.VECTARA_CUSTOMER_ID);
  const corpusId = Number(process.env.VECTARA_CORPUS_ID);
  const apiKey = String(process.env.VECTARA_API_KEY);

  const store = new VectaraStore({
    customerId,
    corpusId,
    apiKey,
    verbose: true,
  });

  let doc_ids;

  // Add two documents with some metadata.
  if (Array.isArray(docs) && docs.length == 1) {
    doc_ids = await store.addDocuments([docs]);
  } else if (Array.isArray(docs) && docs.length > 1) {
    doc_ids = await store.addDocuments(docs);
  }
  return doc_ids;
};
