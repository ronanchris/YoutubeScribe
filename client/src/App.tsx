import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import History from "@/pages/history";
import AuthPage from "@/pages/auth-page";
import AdminPage from "@/pages/admin";
import AcceptInvitationPage from "@/pages/accept-invitation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

function Router() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <div className="flex-grow">
        <Switch>
          <ProtectedRoute path="/" component={Home} />
          <ProtectedRoute path="/history" component={History} />
          <ProtectedRoute path="/admin" component={AdminPage} adminOnly={true} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/accept-invitation" component={AcceptInvitationPage} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
