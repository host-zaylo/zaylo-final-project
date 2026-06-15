import type { APIRoute } from "astro";
import { sendEmail, wrapHtml } from "./resend";

const COMPANY_EMAIL = "contato@zaylo.com.br";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { nome, empresa, cidade, email, telefone, name, marketingConsent } = await request.json();

    let fields = "";
    if (nome || name) fields += `<p><strong>Nome:</strong> ${nome || name}</p>`;
    if (empresa) fields += `<p><strong>Empresa:</strong> ${empresa}</p>`;
    if (cidade) fields += `<p><strong>Cidade:</strong> ${cidade}</p>`;
    if (email) fields += `<p><strong>E-mail:</strong> ${email}</p>`;
    if (telefone) fields += `<p><strong>Telefone:</strong> ${telefone}</p>`;
    if (marketingConsent) fields += `<p><strong>Consentimento de marketing:</strong> Sim</p>`;

    const html = wrapHtml(`
      <h2>Novo contato — Revendedor</h2>
      ${fields}
    `);

    await sendEmail(COMPANY_EMAIL, "Novo contato — Revendedor | ZAYLO", html, "Zaylo");

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (error: any) {
    console.error("Revendedor email error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
