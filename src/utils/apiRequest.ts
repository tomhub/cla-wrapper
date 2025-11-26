import { ClCache } from "../interfaces/interfaces.js";

interface ApiRequestParameters {
  apiKey?: string;
  baseUrl?: string;
  endpoint?: string;
  headers?: any;
  cache?: ClCache;
  useNciSiteForCt: boolean;
  nciSiteUrl: string;
  contentEncoding: string;
}

const nciSiteFolder = {
  adam: "/ADaM/Archive/",
  protocol: "/Protocol/Archive/",
  glossary: "/Glossary/Archive/",
  send: "/SEND/Archive/",
  sdtm: "/SDTM/Archive/",
  qs: "/SDTM/Archive/",
  "qs-ft": "/SDTM/Archive/",
  qrs: "/SDTM/Archive/",
  coa: "/SDTM/Archive/",
  cdash: "/CDASH/Archive/",
  "define-xml": "/Define-XML/Archive/",
};

const nciSitePrefix = {
  adam: "ADaM Terminology",
  protocol: "Protocol Terminology",
  glossary: "CDISC Glossary",
  send: "SEND Terminology",
  sdtm: "SDTM Terminology",
  qs: "QS Terminology",
  "qs-ft": "QS-FT Terminology",
  qrs: "QRS Terminology",
  coa: "COA Terminology",
  cdash: "CDASH Terminology",
  "define-xml": "Define-XML Terminology",
};

type CodeListTypes =
  | "adam"
  | "cdash"
  | "define-xml"
  | "glossary"
  | "coa"
  | "protocol"
  | "qrs"
  | "qs"
  | "qs-ft"
  | "sdtm"
  | "send";

const apiRequest = async ({
  apiKey,
  baseUrl,
  endpoint,
  headers = {},
  cache,
  useNciSiteForCt,
  nciSiteUrl,
  contentEncoding,
}: ApiRequestParameters): Promise<any> => {
  let url: string;
  let fetchHeaders: any = { ...headers };
  let isBinary = false;

  if (endpoint === undefined) {
    throw new Error("Endpoint is required");
  }

  if (
    useNciSiteForCt &&
    /\/mdr\/ct\/packages\/(adam|cdash|define-xml|glossary|coa|protocol|qrs|qs|qs-ft|sdtm|send)ct-\d{4}-\d{2}-\d{2}$/.test(
      endpoint,
    )
  ) {
    const type = endpoint.replace(
      /\/mdr\/ct\/packages\/(.*?)ct-\d{4}-\d{2}-\d{2}$/,
      "$1",
    ) as CodeListTypes;
    const date = endpoint.replace(
      /\/mdr\/ct\/packages\/.*?ct-(\d{4}-\d{2}-\d{2})$/,
      "$1",
    );
    url =
      nciSiteUrl +
      nciSiteFolder[type] +
      nciSitePrefix[type] +
      " " +
      date +
      ".odm.xml";
    fetchHeaders.Accept = "text/xml";
  } else if (endpoint.startsWith("/nciSite/")) {
    const page = endpoint.replace(/\/nciSite(\/.*?)$/, "$1");
    url = nciSiteUrl + page;
    fetchHeaders.Accept = "text/html";
  } else {
    if (baseUrl === undefined) {
      throw new Error("Base URL is required for API requests");
    }
    url = baseUrl + endpoint;
    fetchHeaders.Accept = "application/json";
    if (apiKey !== undefined && apiKey !== "") {
      // OAuth2 authentication
      fetchHeaders["api-key"] = apiKey;
    }
    if (headers.Accept && headers.Accept === "application/vnd.ms-excel") {
      isBinary = true;
    }
  }

  if (contentEncoding !== undefined) {
    fetchHeaders["Content-Encoding"] = contentEncoding;
  }

  // Check cache
  if (cache !== undefined && typeof cache.match === "function") {
    const cachedResponse = await cache.match({ url, headers: fetchHeaders });
    if (cachedResponse !== undefined) {
      return cachedResponse;
    }
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: fetchHeaders,
    });

    let body: any;
    if (isBinary) {
      const arrayBuffer = await response.arrayBuffer();
      body = Buffer.from(arrayBuffer);
    } else {
      body = await response.text();
    }

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    const result = {
      statusCode: response.status,
      headers: responseHeaders,
      body: body,
      connection: {
        bytesRead:
          Number(response.headers.get("content-length")) ||
          (body.length ? body.length : 0),
        bytesWritten: 0, // Fetch doesn't expose this easily
      },
    };

    // Cache response
    if (
      cache !== undefined &&
      typeof cache.put === "function" &&
      response.status === 200
    ) {
      await cache.put({ url, headers: fetchHeaders }, result);
    }

    return result;
  } catch (error: any) {
    // Return error object similar to request library error
    return {
      statusCode: 0,
      description: error.message,
      connection: { bytesRead: 0, bytesWritten: 0 },
    };
  }
};

export default apiRequest;
