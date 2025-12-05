import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Musicians from "@/pages/Musicians";
import MusicianDetail from "@/pages/MusicianDetail";
import Marketplace from "@/pages/Marketplace";
import ListingDetail from "@/pages/ListingDetail";
import Dashboard from "@/pages/Dashboard";
import Messages from "@/pages/Messages";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <Route path="/" component={Home} />
      )}
      <Route path="/musicians" component={Musicians} />
      <Route path="/musicians/:id" component={MusicianDetail} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/marketplace/:id" component={ListingDetail} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/messages" component={Messages} />
      <Route path="/messages/:userId" component={Messages} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
