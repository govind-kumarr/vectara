import express from "express";
import { config } from "dotenv";
import {
  githubLoader,
  notionDbLoader,
  notionPageLoader,
  webLoader,
} from "./loaders.js";
import { VectaraAPI_Client, addDocstoVectara } from "./vectara.js";
config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const customerId = Number(process.env.VECTARA_CUSTOMER_ID);

function intializeVectara(corpusId) {
  const vc_client = new VectaraAPI_Client(customerId, corpusId);
  return vc_client;
}

app.post("/load/website", async (req, res) => {
  try {
    const { website, corpusId, documentTitle, documentId } = req.body;
    const docs = await webLoader(website);
    const vc_client = intializeVectara(corpusId);
    const response = await vc_client.addDocs(
      docs,
      corpusId,
      documentId,
      documentTitle
    );
    console.log(response);
    res.send({ message: "success" });
  } catch (error) {
    console.log(error);
    res.send({ message: "something went wrong!" });
  }
});

app.post("/load/github", async (req, res) => {
  try {
    const { github_url, corpusId, documentTitle, documentId } = req.body;
    const docs = await githubLoader(github_url);
    const vc_client = intializeVectara(corpusId);
    const response = await vc_client.addDocs(
      docs,
      corpusId,
      documentTitle,
      documentId
    );
    console.log(response);
    res.send({ message: "success" });
  } catch (error) {
    console.log(error);
    res.send({ message: "something went wrong!" });
  }
});

app.post("/load/notion", async (req, res) => {
  try {
    const { pageId, dbId, corpusId, documentTitle, documentId } = req.body;
    console.log({ pageId, dbId, corpusId, documentTitle, documentId });
    const responseArr = [];
    if (pageId) {
      const docs = await notionPageLoader(pageId);
      console.log(docs, "docs");
      const vc_client = intializeVectara(corpusId);
      const res = await vc_client.addDocs(
        docs,
        corpusId,
        documentTitle,
        documentId
      );
      console.log(res);
      responseArr.push({
        message: "sucess",
      });
    }
    if (dbId) {
      const docs = await notionDbLoader(dbId);
      const res = await vc_client.addDocs(docs);
      console.log(res);
      responseArr.push({
        message: "sucess",
      });
    }
    res.send(responseArr);
  } catch (error) {
    console.log(error);
    res.send({ message: "something went wrong!" });
  }
});

app.get("/", (req, res) => {
  res.send(`App is running on port: ${PORT}`);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
