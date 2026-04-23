import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./Context/ToastContext";
import App from "./App";
import {
  SearchResults, StocksPage, Stock,
  IndividualScreenPage, CustomScreenerPage, SignInPage, SignupPage,
  SettingsPage, AdminPage, HelpPage
} from "./Pages";
import AdminRoute from "./Components/AdminRoute";
import ProtectedRoute from "./Components/ProtectedRoute";
import { AuthProvider } from "./Context/AuthContext";
import { ThemeProvider } from "./Context/ThemeContext.tsx";
import { PreferencesProvider } from "./Context/PreferencesContext.tsx";
import { FilterDataProvider } from "./Context/FilterDataContext";
import { ErrorBoundary } from "./ErrorBoundry";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <ThemeProvider>
      <PreferencesProvider>
        <AuthProvider>
          <ToastProvider>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
            <Routes>
            <Route path="/" element={<FilterDataProvider><IndividualScreenPage /></FilterDataProvider>} />
            <Route index element={<FilterDataProvider><IndividualScreenPage /></FilterDataProvider>} />
            <Route path="/account" element={<App />} />
            <Route path="/login" element={<SignInPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/search/:query" element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />
            <Route path="/stock/:token" element={<ProtectedRoute><Stock /></ProtectedRoute>} />
            <Route path="/stocks" element={<ProtectedRoute><StocksPage /></ProtectedRoute>} />
            <Route path="/screener/:id" element={<FilterDataProvider><IndividualScreenPage /></FilterDataProvider>} />
            <Route path="/create-custom-screener" element={<CustomScreenerPage />} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
            <Route path="/admin-page" element={<AdminRoute><AdminPage /></AdminRoute>} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
          </ToastProvider>
    </AuthProvider>
      </PreferencesProvider>
    </ThemeProvider>
  </ErrorBoundary>
);