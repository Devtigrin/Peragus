// Simulated Pix copy-and-paste code. NOT a real BR Code; sandbox only.
export function generatePixCode(operationId: string): string {
  return `00020126SANDBOX-PERAGUS${operationId.replace(/-/g, '').slice(0, 20).toUpperCase()}5204000053039865802BR`
}
