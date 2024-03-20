import express from "express";
import { config } from "dotenv";
import {
  githubLoader,
  notionDbLoader,
  notionPageLoader,
  webLoader,
} from "./loaders.js";
import { addDocstoVectara } from "./vectara.js";
config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post("/load/website", async (req, res) => {
  const { website } = req.body;
  const docs = await webLoader(website);
  const doc_ids = await addDocstoVectara(docs);
  res.send({ message: "success", doc_ids });
});

app.post("/load/github", async (req, res) => {
  const { github_url } = req.body;
  const docs = await githubLoader(github_url);
  const doc_ids = await addDocstoVectara(docs);
  res.send({ message: "success", doc_ids });
});

app.post("/load/notion", async (req, res) => {
  const { pageId, dbId } = req.body;
  const responseArr = [];
  if (pageId) {
    const docs = await notionPageLoader(pageId);
    const doc_ids = docs ? await addDocstoVectara(docs) : null;
    responseArr.push({
      message: doc_ids ? "Docs added successfully." : "Failure",
      doc_ids,
    });
  }
  if (dbId) {
    const docs = await notionDbLoader(dbId);
    const doc_ids = docs ? await addDocstoVectara(docs) : null;
    responseArr.push({
      message: doc_ids ? "Docs added successfully." : "Failure",
      doc_ids,
    });
  }
  res.send(responseArr);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
