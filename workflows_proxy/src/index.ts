import { Elysia, t } from "elysia";
import "dotenv/config";

const CONFIG = {
  PORT: process.env.WORKFLOWS_PROXY_PORT || 9092,
  UPSTREAM_BASE: process.env.WORKFLOWS_PROXY_UPSTREAM_BASE || 'http://localhost:9090',
  BEARER_TOKEN: process.env.WORKFLOWS_PROXY_BEARER_TOKEN || 'abc',
  BASIC_AUTH: process.env.WORKFLOWS_PROXY_BASIC_AUTH, // Eg. 'username:password'
  DRY_RUN: process.env.WORKFLOWS_PROXY_DRY_RUN === 'true',
  ALLOWED_METHODS: new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
}

const app = new Elysia()
  .decorate("basicAuth", CONFIG.BASIC_AUTH ?
    "Basic " + Buffer.from(CONFIG.BASIC_AUTH).toString('base64') :
    null
  )
  .get("/up", () => "OK")
  .post(
    "/forward",
    async ({
      request,
      body,
      set,
      basicAuth
    }) => {
      // 1. Authorization check
      const authHeader = request.headers.get("authorization");
      if (!authHeader || authHeader !== `Bearer ${CONFIG.BEARER_TOKEN}`) {
        set.status = 401;
        return "Unauthorized";
      }

      // 2. Validate incoming payload
      const { method, path, headers = {}, payload } = body;
      if (!path) {
        set.status = 400;
        return "Path is required";
      }
      if (!method || !CONFIG.ALLOWED_METHODS.has(method.toUpperCase())) {
        set.status = 400;
        return "Invalid or missing method";
      }

      // 3. Construct the upstream request
      let upstreamUrl = `${CONFIG.UPSTREAM_BASE}${path}`;
      const upstreamHeaders = new Headers(headers);
      if (basicAuth) {
        upstreamHeaders.set("Authorization", basicAuth);
      }

      const requestOptions = {
        method,
        headers: upstreamHeaders,
      };

      // Handle query parameters for GET requests
      if (method.toUpperCase() === 'GET' && payload) {
        const queryParams = new URLSearchParams(payload).toString();
        const separator = path.includes("?") ? "&" : "?";
        upstreamUrl = `${upstreamUrl}${separator}${queryParams}`;
      } else if (payload && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
        // Handle POST, PUT, PATCH payloads
        const contentType = upstreamHeaders.get("Content-Type");

        if (contentType?.includes("application/json")) {
          requestOptions.body = JSON.stringify(payload);
        } else if (contentType?.includes("application/x-www-form-urlencoded")) {
          requestOptions.body = new URLSearchParams(payload).toString();
        } else if (contentType?.includes("multipart/form-data")) {
          const formData = new FormData();

          // Handle different payload structures
          if (typeof payload === 'object' && payload !== null) {
            for (const [key, value] of Object.entries(payload)) {
              if (value instanceof File) {
                formData.append(key, value, value.name);
              } else if (value instanceof Blob) {
                formData.append(key, value);
              } else if (Array.isArray(value)) {
                // Handle array values (multiple values for same key)
                value.forEach(item => {
                  if (item instanceof File) {
                    formData.append(key, item, item.name);
                  } else if (item instanceof Blob) {
                    formData.append(key, item);
                  } else {
                    formData.append(key, String(item));
                  }
                });
              } else {
                formData.append(key, String(value));
              }
            }
          }

          requestOptions.body = formData;
          // Remove Content-Type header to let fetch set it with proper boundary
          upstreamHeaders.delete("Content-Type");
        } else {
          // Fallback for other content types or when no content-type specified
          if (typeof payload === 'object') {
            // Try to JSON stringify objects if no content type is specified
            upstreamHeaders.set("Content-Type", "application/json");
            requestOptions.body = JSON.stringify(payload);
          } else {
            requestOptions.body = String(payload);
          }
        }
      }

      // 4. Forward the request
      console.log(`Forwarding request to: ${upstreamUrl}`);
      console.log(`Method: ${method}`);
      console.log(`Headers:`, Object.fromEntries(upstreamHeaders.entries()));

      if (CONFIG.DRY_RUN) {
        return {
          status: "Dry run successful",
          upstreamUrl,
          method,
          headers: Object.fromEntries(upstreamHeaders.entries()),
          hasBody: !!requestOptions.body,
          bodyType: requestOptions.body?.constructor?.name || 'undefined'
        };
      }

      try {
        const response = await fetch(upstreamUrl, requestOptions);
        const responseBody = await response.text();

        set.status = response.status;
        // Forward response headers (excluding problematic ones)
        for (const [key, value] of response.headers.entries()) {
          if (!["transfer-encoding", "content-encoding", "connection"].includes(key.toLowerCase())) {
            set.headers[key] = value;
          }
        }
        return responseBody;
      } catch (error) {
        console.error("Forwarding failed:", error);
        set.status = 500;
        return "Internal Server Error";
      }
    },
    {
      body: t.Object({
        method: t.String(),
        path: t.String(),
        headers: t.Optional(t.Record(t.String(), t.String())),
        payload: t.Optional(t.Any()),
      }),
    }
  )
  .listen(CONFIG.PORT);

console.log(
  `Server running at ${app.server?.hostname}:${app.server?.port}`
);
