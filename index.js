const dotenv = require("dotenv");
const express = require("express");
const ImgixClient = require("imgix-core-js");

dotenv.config();

const ALLOWED_HOSTS = ["https://s3-us-west-2.amazonaws.com/leafly-images"];

function main({ domain, key, port }) {
  const client = new ImgixClient({
    domain: domain,
    includeLibraryParam: false,
    secureURLToken: key
  });

  const app = express();

  app.get("/*", (request, response) => {
    const source = decodeURIComponent(request.path.slice(1));
    const options = request.query;

    if (source.trim() === "") {
      return response.status(400).send("");
    }

    if (!Object.values(options).length || !isAllowed(source)) {
      return response.redirect(source);
    }

    response.redirect(client.buildURL(source, options));
  });

  app.disable('x-powered-by');
  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
}

function isAllowed(source) {
  return ALLOWED_HOSTS.some(h => source.startsWith(h));
}

main({ port: 4302, domain: process.env.IMGIX_URL, key: process.env.IMGIX_KEY });
