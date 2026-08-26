const year = new Date().getFullYear()

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function wrap(title: string, preheader: string, inner: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,'Segoe UI',sans-serif">
<div style="display:none;font-size:1px;color:#f4f4f5;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5"><tr><td align="center" style="padding:40px 16px">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;border:1px solid #e4e4e7;overflow:hidden">
${inner}
</table>
</td></tr></table>
</body></html>`
}

function hdr(): string {
  return `<tr><td style="background:#18181b;padding:28px 32px;text-align:center"><span style="color:#fff;font-size:18px;font-weight:600;letter-spacing:-.02em">Peragus</span></td></tr>`
}

function ftr(): string {
  return `<tr><td style="background:#fafafa;padding:16px 32px;border-top:1px solid #e4e4e7;text-align:center"><p style="margin:0;color:#a1a1aa;font-size:12px">© ${year} Peragus · Sandbox de operações financeiras</p></td></tr>`
}

export function passwordResetEmail(url: string) {
  const inner = `${hdr()}
<tr><td style="padding:32px">
<h2 style="margin:0 0 16px;font-size:18px;color:#18181b;font-weight:600">Recuperação de senha</h2>
<p style="margin:0 0 24px;color:#52525b;line-height:1.6;font-size:15px">Clique no botão abaixo para definir uma nova senha. Este link expira em <strong>1 hora</strong>.</p>
<a href="${esc(url)}" style="display:inline-block;background:#18181b;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:500;font-size:15px">Redefinir senha</a>
<p style="margin:24px 0 0;color:#a1a1aa;font-size:13px;line-height:1.5">Se você não solicitou esta alteração, ignore este e-mail.</p>
</td></tr>${ftr()}`
  return { subject: 'Recupere sua senha – Peragus', html: wrap('Recuperação de senha', 'Um link de recuperação de senha foi solicitado.', inner) }
}

export function welcomeEmail(userName?: string) {
  const greet = userName ? `Olá ${esc(userName)},` : 'Olá,'
  const inner = `${hdr()}
<tr><td style="padding:32px">
<h2 style="margin:0 0 16px;font-size:18px;color:#18181b;font-weight:600">Bem-vindo ao Peragus</h2>
<p style="margin:0 0 16px;color:#52525b;line-height:1.6;font-size:15px">${greet}</p>
<p style="margin:0 0 24px;color:#52525b;line-height:1.6;font-size:15px">Sua conta foi criada com sucesso. Você já pode acessar o sandbox e operar com MockUSDT na rede Polygon Amoy.</p>
<a href="https://peragus.com.br/app" style="display:inline-block;background:#18181b;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:500;font-size:15px">Acessar o sandbox</a>
<p style="margin:24px 0 0;color:#a1a1aa;font-size:13px;line-height:1.5">Este é um ambiente de testes. Nenhuma transação real é processada.</p>
</td></tr>${ftr()}`
  return { subject: 'Bem-vindo ao Peragus', html: wrap('Bem-vindo ao Peragus', 'Sua conta foi criada. Acesse o sandbox.', inner) }
}

export function operationConfirmedEmail(p: { operationId: string; amount: string; receiverWallet: string }) {
  const w = p.receiverWallet
  const shortW = `${w.slice(0, 10)}…${w.slice(-8)}`
  const inner = `${hdr()}
<tr><td style="padding:32px">
<h2 style="margin:0 0 16px;font-size:18px;color:#18181b;font-weight:600">Operação confirmada</h2>
<p style="margin:0 0 24px;color:#52525b;line-height:1.6;font-size:15px">Sua operação foi processada com sucesso.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;border-radius:6px;margin:0 0 24px"><tr><td style="padding:16px">
<table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px">
<tr><td style="padding:4px 0;color:#71717a">ID</td><td style="padding:4px 0;color:#18181b;font-family:monospace;text-align:right">${esc(p.operationId.slice(0, 8))}…</td></tr>
<tr><td style="padding:4px 0;color:#71717a">Valor</td><td style="padding:4px 0;color:#18181b;text-align:right">${esc(p.amount)} MOCKUSDT</td></tr>
<tr><td style="padding:4px 0;color:#71717a">Destino</td><td style="padding:4px 0;color:#18181b;font-family:monospace;text-align:right;font-size:12px">${esc(shortW)}</td></tr>
</table>
</td></tr></table>
<a href="https://peragus.com.br/app" style="display:inline-block;background:#18181b;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:500;font-size:15px">Ver detalhes</a>
</td></tr>${ftr()}`
  return { subject: 'Operação confirmada – Peragus', html: wrap('Operação confirmada', 'Sua operação foi processada com sucesso.', inner) }
}
