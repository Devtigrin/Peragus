import { Route, Routes, useLocation } from 'react-router-dom'
import { MarketingLayout } from '@/components/layout/MarketingLayout'
import { Landing } from '@/pages/Landing'
import { LegalPage } from '@/pages/Legal'
import { NotFound } from '@/pages/NotFound'
import { Login } from '@/pages/auth/Login'
import { Register } from '@/pages/auth/Register'
import { ForgotPassword } from '@/pages/auth/ForgotPassword'
import { ResetPassword } from '@/pages/auth/ResetPassword'
import { RequireAuth } from '@/auth/RequireAuth'
import { AppLayout } from '@/components/app/AppLayout'
import { Operations } from '@/pages/app/Operations'
import { LOCALES, appPath, homePath, localeFromPathname } from '@/i18n/routing'

function LocalizedNotFound() {
  const location = useLocation()
  return <NotFound locale={localeFromPathname(location.pathname)} />
}

export default function App() {
  return (
    <Routes>
      {LOCALES.map((locale) => (
        <Route key={locale} path={homePath(locale)} element={<MarketingLayout locale={locale} />}>
          <Route index element={<Landing locale={locale} />} />
          {(['terms', 'privacy', 'compliance', 'security'] as const).map((type) => (
            <Route key={type} path={type} element={<LegalPage locale={locale} type={type} />} />
          ))}
          <Route path="login" element={<Login locale={locale} />} />
          <Route path="register" element={<Register locale={locale} />} />
          <Route path="recuperar-senha" element={<ForgotPassword locale={locale} />} />
          <Route path="resetar-senha" element={<ResetPassword locale={locale} />} />
        </Route>
      ))}
      {LOCALES.map((locale) => (
        <Route
          key={locale}
          path={appPath(locale)}
          element={
            <RequireAuth>
              <AppLayout locale={locale}>
                <Operations locale={locale} />
              </AppLayout>
            </RequireAuth>
          }
        />
      ))}
      <Route path="*" element={<LocalizedNotFound />} />
    </Routes>
  )
}
