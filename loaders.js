import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import { GithubRepoLoader } from "langchain/document_loaders/web/github";
import { NotionAPILoader } from "langchain/document_loaders/web/notionapi";

export const webLoader = async (website) => {
  if (!website) return false;
  const loader = new PuppeteerWebBaseLoader(website);

  const docs = await loader.loadAndSplit();
  return docs;
};
export const githubLoader = async (repoUrl, branch, recursive) => {
  const loader = new GithubRepoLoader(repoUrl, {
    branch: branch || "main",
    recursive: recursive || false,
    unknown: "warn",
    maxConcurrency: 5,
  });
  const docs = await loader.loadAndSplit();
  return docs;
};

const notionsIntegrationToken = process.env.NOTION_INTEGRATION_TOKEN;

export const notionDbLoader = async (dbId) => {
  if (!notionsIntegrationToken)
    return {
      message: "Notion Authentication Failed",
      reason: "NOTION_INTEGRATION_TOKEN not found",
    };

  const dbLoader = new NotionAPILoader({
    clientOptions: {
      auth: notionsIntegrationToken,
    },
    id: dbId,
    type: "database",
    onDocumentLoaded: (current, total, currentTitle) => {
      console.log(`Loaded Page: ${currentTitle} (${current}/${total})`);
    },
    callerOptions: {
      maxConcurrency: 64,
    },
    propertiesAsHeader: true,
  });

  const dbDocs = await dbLoader.load();

  return dbDocs;
};

export const notionPageLoader = async (pageId) => {
  if (!notionsIntegrationToken)
    return {
      message: "Notion Authentication Failed",
      reason: "NOTION_INTEGRATION_TOKEN not found",
    };

  const pageLoader = new NotionAPILoader({
    clientOptions: {
      auth: notionsIntegrationToken,
    },
    id: pageId,
    type: "page",
  });

  const pageDocs = await pageLoader.loadAndSplit();
  return pageDocs;
};
