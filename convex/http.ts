import { httpRouter } from "convex/server";
import { handleClerkWebhook } from "./webhooks/clerk";

const http = httpRouter();

// Clerk webhook endpoint
http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: handleClerkWebhook,
});

export default http;
