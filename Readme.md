# Installation

Requirements: NodeJS >= 19.0.0

- Run npm install
- Create a .env file and set Environment variables
- Run npm start

The app consist of three routes to load docs.

# Website Loader

route is /load/website
Purpose: To load data from website

Tou use this route you will need to pass website in the body of request and all the docs will get ingested to the vectara index.The ids of docs will be returned as response along with success message

Example:
{
wesite: 'https://www.google.com/'
}

# Github Loader

route is /load/github
method is 'POST'
Purpose: To load data from Github repo

Tou use this route you will need to pass github_url in the body of request and all the docs will get ingested to the vectara index.The ids of docs will be returned as response along with success message

Note : The repo should be public

Example:
{
github_url: 'https://github.com/govind-kumarr/vectara'
}

# Notion Loader

route is /load/notion
method is 'POST'
Purpose: To load data from Notion pages or db

Tou use this route you will need to pass pageId or dbId in the body of request and all the docs will get ingested to the vectara index.The ids of docs will be returned as response along with success message

Note : The repo should be public

Example:
{
pageId: 'your_notion_page_id',
dbId: 'your_notion_db_id'
}

or
{
pageId: 'your_notion_page_id'
}

or
{
pageId: 'your_notion_page_id'
}
