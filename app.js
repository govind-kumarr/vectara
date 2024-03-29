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
const corpusId = Number(process.env.VECTARA_CORPUS_ID);

const vc_client = new VectaraAPI_Client(customerId, corpusId);

app.post("/load/website", async (req, res) => {
  try {
    const { website } = req.body;
    const docs = await webLoader(website);
    const response = await vc_client.addDocs(docs);
    console.log(response);
    res.send({ message: "success" });
  } catch (error) {
    console.log(error);
    res.send({ message: "something went wrong!" });
  }
});

app.post("/load/github", async (req, res) => {
  try {
    const { github_url } = req.body;
    const docs = await githubLoader(github_url);
    const response = await vc_client.addDocs(docs);
    console.log(response);
    res.send({ message: "success" });
  } catch (error) {
    console.log(error);
    res.send({ message: "something went wrong!" });
  }
});

app.post("/load/notion", async (req, res) => {
  try {
    const { pageId, dbId } = req.body;
    const responseArr = [];
    if (pageId) {
      const docs = await notionPageLoader(pageId);
      const res = await vc_client.addDocs(docs);
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
  console.log(`App is running on port: ${PORT}`);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
