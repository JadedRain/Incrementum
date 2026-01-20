import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {Toaster} from "react-hot-toast";
import App from "./App";
import SearchResults from "./Pages/SearchResults";
import StocksPage from './Pages/StocksPage'
import Stock from "./Pages/Stock";
import ScreenerPage from "./Pages/ScreenerPage";
import ScreenerTestPage from "./Pages/ScreenerTestPage";
import IndividualScreenPage from "./Pages/IndividualScreenPage";
import CustomScreenerPage from "./Pages/CustomScreenerPage";
import SignInPage from "./Pages/LogInPage";
import SignupPage from "./Pages/SignupPage";
import IndividualCustomCollectionPage from "./Pages/IndividualCustomCollectionPage";
import CustomCollectionsPage from "./Pages/CustomCollectionsPage";
import SettingsPage from "./Pages/SettingsPage";
import CreateCustomCollectionPage from "./Pages/CreateCustomCollectionPage";
import FilterPage from "./Pages/FilterPageTest";
import SidebarTestPage from "./Pages/SidebarTestPage";
import AdminPage from "./Pages/AdminPage";
import AdminRoute from "./Components/AdminRoute";
import ProtectedRoute from "./Components/ProtectedRoute";
import { AuthProvider } from "./Context/AuthContext";
import { FilterDataProvider } from "./Context/FilterDataContext";
import { ErrorBoundary } from "./ErrorBoundry";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <AuthProvider>
      <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 3000
                  }}
              />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/screener" element={<ScreenerPage />} />
            <Route path="/screener-test" element={<ProtectedRoute><ScreenerTestPage /></ProtectedRoute>} />
            <Route path="/" element={<App />} />
            <Route index element={<SignInPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/search/:query" element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />
            <Route path="/stock/:token" element={<ProtectedRoute><Stock /></ProtectedRoute>} />
            <Route path="/stocks" element={<ProtectedRoute><StocksPage /></ProtectedRoute>} />
            <Route path="/screener/:id" element={<FilterDataProvider><IndividualScreenPage /></FilterDataProvider>} />
            <Route path="/create-custom-screener" element={<CustomScreenerPage />} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/custom-collection/:id" element={<ProtectedRoute><FilterDataProvider><IndividualCustomCollectionPage /></FilterDataProvider></ProtectedRoute>} />
            <Route path="/custom-collections" element={<ProtectedRoute><CustomCollectionsPage /></ProtectedRoute>} />
            <Route path="/create-custom-collection" element={<ProtectedRoute><CreateCustomCollectionPage /></ProtectedRoute>} />
            <Route path="/filter-test" element={<ProtectedRoute><FilterPage /></ProtectedRoute>} />
            <Route path="/sidebar-test" element={<ProtectedRoute><SidebarTestPage /></ProtectedRoute>} />
            <Route path="/admin-page" element={<AdminRoute><AdminPage /></AdminRoute>} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </AuthProvider>
  </ ErrorBoundary>
);