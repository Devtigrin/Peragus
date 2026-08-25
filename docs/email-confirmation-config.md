# Configuração de Confirmação de Email

## Onde acessar
https://supabase.com/dashboard/project/iifcwnumpccoucxggxjb/auth/settings

## Configuração atual (desenvolvimento)
- Enable email confirmations: DESABILITADO

## Para reativar em produção
1. Acessar o link acima
2. Marcar "Enable email confirmations"
3. Testar fluxo: cadastro → email → confirmação → login

## Impacto
- DESABILITADO: signUp() retorna sessão imediatamente
- HABILITADO: signUp() envia email, sessão é null até confirmação
