import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/clerk-react";
import { internal } from "../_generated/api";
import { httpAction } from "../_generated/server";

export const handleClerkWebhook = httpAction(async (ctx, request) => {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  // Get the headers
  const svix_id = request.headers.get("svix-id");
  const svix_timestamp = request.headers.get("svix-timestamp");
  const svix_signature = request.headers.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  // Get the body
  const payload = await request.text();

  // Verify the webhook
  const wh = new Webhook(webhookSecret);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Webhook verification failed", { status: 400 });
  }

  // Handle the webhook event
  const eventType = evt.type;

  try {
    switch (eventType) {
      case "user.created": {
        const { id, email_addresses, first_name, last_name } = evt.data;
        const primaryEmail = email_addresses.find(
          (email) => email.id === evt.data.primary_email_address_id
        );

        await ctx.runMutation(internal.users.mutations.createFromWebhook, {
          clerkId: id,
          email: primaryEmail?.email_address || "",
          firstName: first_name || undefined,
          lastName: last_name || undefined,
        });

        console.log(`User created: ${id}`);
        break;
      }

      case "user.updated": {
        const { id, email_addresses, first_name, last_name } = evt.data;
        const primaryEmail = email_addresses.find(
          (email) => email.id === evt.data.primary_email_address_id
        );

        await ctx.runMutation(internal.users.mutations.updateFromWebhook, {
          clerkId: id,
          email: primaryEmail?.email_address,
          firstName: first_name || undefined,
          lastName: last_name || undefined,
        });

        console.log(`User updated: ${id}`);
        break;
      }

      case "user.deleted": {
        const { id } = evt.data;
        if (id) {
          await ctx.runMutation(internal.users.mutations.deleteFromWebhook, {
            clerkId: id,
          });
          console.log(`User deleted: ${id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return new Response("Webhook processed", { status: 200 });
  } catch (error) {
    console.error(`Error processing webhook ${eventType}:`, error);
    return new Response("Webhook processing failed", { status: 500 });
  }
});
