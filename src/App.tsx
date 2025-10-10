import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { CurrencyProvider } from "@/hooks/useCurrency";
import { SettingsProvider, useSettings } from "@/hooks/useSettings";
import { ThemeSync } from "@/components/ThemeSync";
import { useEffect } from "react";
import Index from "./pages/Index";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Finances from "./pages/Finances";
import Analytics from "./pages/Analytics";
import Auth from "./pages/Auth";
import VerifyEmail from "./pages/VerifyEmail";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Language Wrapper - syncs route language with user settings
const LanguageWrapper = ({ children }: { children: React.ReactNode }) => {
  const { lang } = useParams<{ lang: string }>();
  const { settings, updateSettings } = useSettings();
  const navigate = useNavigate();

  useEffect(() => {
    const validLangs = ['ar', 'en'];
    const currentLang = lang && validLangs.includes(lang) ? lang : 'en';
    
    // Sync settings with route language
    if (settings.language !== currentLang) {
      updateSettings({ language: currentLang });
    }

    // Set document direction for RTL/LTR
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [lang, settings.language, updateSettings]);

  return <>{children}</>;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { lang } = useParams<{ lang: string }>();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to={`/${lang}/auth`} replace />;
  }
  
  return <>{children}</>;
};

// Language redirect component
const LanguageRedirect = () => {
  const { settings } = useSettings();
  const preferredLang = settings.language || 'en';
  
  return <Navigate to={`/${preferredLang}/dashboard`} replace />;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  const { settings } = useSettings();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <Routes>
      {/* Root redirect to preferred language */}
      <Route path="/" element={<Navigate to={`/${settings.language || 'en'}`} replace />} />
      
      {/* Language-specific routes */}
      <Route path="/:lang" element={<LanguageWrapper><Index /></LanguageWrapper>} />
      <Route path="/:lang/about" element={<LanguageWrapper><About /></LanguageWrapper>} />
      <Route path="/:lang/auth" element={
        <LanguageWrapper>
          {user ? <LanguageRedirect /> : <Auth />}
        </LanguageWrapper>
      } />
      <Route path="/:lang/verify-email" element={<LanguageWrapper><VerifyEmail /></LanguageWrapper>} />
      
      {/* Protected routes */}
      <Route path="/:lang/dashboard" element={
        <LanguageWrapper>
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </LanguageWrapper>
      } />
      <Route path="/:lang/portfolio" element={
        <LanguageWrapper>
          <ProtectedRoute>
            <Portfolio />
          </ProtectedRoute>
        </LanguageWrapper>
      } />
      <Route path="/:lang/finances" element={
        <LanguageWrapper>
          <ProtectedRoute>
            <Finances />
          </ProtectedRoute>
        </LanguageWrapper>
      } />
      <Route path="/:lang/analytics" element={
        <LanguageWrapper>
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        </LanguageWrapper>
      } />
      <Route path="/:lang/settings" element={
        <LanguageWrapper>
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        </LanguageWrapper>
      } />
      
      {/* Legacy routes redirect to language version */}
      <Route path="/auth" element={<Navigate to={`/${settings.language || 'en'}/auth`} replace />} />
      <Route path="/dashboard" element={<Navigate to={`/${settings.language || 'en'}/dashboard`} replace />} />
      <Route path="/portfolio" element={<Navigate to={`/${settings.language || 'en'}/portfolio`} replace />} />
      <Route path="/finances" element={<Navigate to={`/${settings.language || 'en'}/finances`} replace />} />
      <Route path="/analytics" element={<Navigate to={`/${settings.language || 'en'}/analytics`} replace />} />
      <Route path="/settings" element={<Navigate to={`/${settings.language || 'en'}/settings`} replace />} />
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <SettingsProvider>
            <CurrencyProvider>
              <BrowserRouter>
                <ThemeSync />
                <AppRoutes />
              </BrowserRouter>
            </CurrencyProvider>
          </SettingsProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
