export interface RecoveryUrlInfo {
  origin: string
  pathname: string
  hashError: string | null
  hashAccessToken: boolean
  tokenHash: string | null
  type: string | null
  isRecoveryPayload: boolean
}

// Reads a URL and reports which recovery payload (if any) it carries.
// Only booleans and key names are reported here; raw tokens are never exposed.
export function describeRecoveryUrl(url: string): RecoveryUrlInfo {
  const u = new URL(url)
  const hashParams = new URLSearchParams(u.hash.replace(/^#/, ''))
  const hashError =
    hashParams.get('error') ?? hashParams.get('error_code') ?? hashParams.get('error_description')
  const tokenHash = u.searchParams.get('token_hash')
  const type = u.searchParams.get('type')
  return {
    origin: u.origin,
    pathname: u.pathname,
    hashError,
    hashAccessToken: Boolean(hashParams.get('access_token')),
    tokenHash,
    type,
    isRecoveryPayload: Boolean(
      hashError || hashParams.get('access_token') || (tokenHash !== null && type === 'recovery'),
    ),
  }
}

// Diagnostic line so a failed email-link click can be traced in the console.
export function logRecoveryDiagnostics(info: RecoveryUrlInfo): string {
  const line = [
    '[recovery]',
    `origin=${info.origin}`,
    `pathname=${info.pathname}`,
    `hashError=${info.hashError}`,
    `hashAccessToken=${info.hashAccessToken}`,
    `tokenHash=${info.tokenHash ? 'present' : 'missing'}`,
    `type=${info.type}`,
  ].join(' ')
  console.warn(line)
  return line
}