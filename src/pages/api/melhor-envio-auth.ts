import type { APIRoute } from "astro";
import { setupMETokensTable, saveMETokens, getMETokens } from "./turso";

const ME_CLIENT_ID = import.meta.env.MELHOR_ENVIO_CLIENT_ID ?? "";
const ME_CLIENT_SECRET = import.meta.env.MELHOR_ENVIO_CLIENT_SECRET ?? "";
const ME_REDIRECT_URI = import.meta.env.MELHOR_ENVIO_REDIRECT_URI ?? "";
const ME_TOKEN_URL = "https://melhorenvio.com.br/oauth/token";
const ME_AUTH_URL = "https://melhorenvio.com.br/oauth/authorize";
export const ME_BASE = "https://melhorenvio.com.br/api/v2/me";
export const USER_AGENT = "Zaylo Shop (contato@zaylo.com.br)";

export async function getMEToken(): Promise<string> {
  await setupMETokensTable();
  const tokens = await getMETokens();

  if (!tokens) {
    throw new Error("ME not authorized — visit /api/melhor-envio-auth to authorize");
  }

  if (tokens.access_token && Date.now() < tokens.expires_at) {
    return tokens.access_token;
  }

  if (!tokens.refresh_token) {
    throw new Error("ME no refresh token — re-authorize via /api/melhor-envio-auth");
  }

  if (tokens.refresh_expires_at && Date.now() > tokens.refresh_expires_at) {
    throw new Error("ME refresh token expired (25d) — visit /api/melhor-envio-auth to re-authorize");
  }

  console.log("[ME] access_token expired, refreshing...");
  const res = await fetch(ME_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
    body: JSON.stringify({
      grant_type: "refresh_token",
      client_id: parseInt(ME_CLIENT_ID),
      client_secret: ME_CLIENT_SECRET,
      refresh_token: tokens.refresh_token,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`ME refresh failed: ${JSON.stringify(data)}`);

  await saveMETokens(data.access_token, data.refresh_token ?? tokens.refresh_token, data.expires_in ?? 2592000);
  console.log("[ME] Token refreshed and saved to Turso");
  return data.access_token as string;
}

// GET /api/melhor-envio-auth         → redirects to ME authorization page

export const GET: APIRoute = async ({ url }) => {
  const code = url.searchParams.get("code");

  if (!code) {
    const authUrl = new URL(ME_AUTH_URL);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", ME_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", ME_REDIRECT_URI);
    authUrl.searchParams.set("scope", "cart-read cart-write shipping-calculate shipping-checkout shipping-generate shipping-print shipping-tracking");
    authUrl.searchParams.set("state", "zaylo");
    return Response.redirect(authUrl.toString(), 302);
  }

  try {
    const body = JSON.stringify({
      grant_type: "authorization_code",
      client_id: parseInt(ME_CLIENT_ID),
      client_secret: ME_CLIENT_SECRET,
      redirect_uri: ME_REDIRECT_URI,
      code,
    });
    const res = await fetch(ME_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": USER_AGENT,
      },
      body,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(JSON.stringify(data));

    await setupMETokensTable();
    await saveMETokens(data.access_token, data.refresh_token, data.expires_in ?? 2592000);

    console.log("[ME] Authorized and saved to Turso!");

    return new Response(
      JSON.stringify({
        ok: true,
        message: "ME authorized! Tokens saved to Turso.",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};