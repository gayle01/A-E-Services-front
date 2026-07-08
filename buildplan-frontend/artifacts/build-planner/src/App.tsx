import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "@/landing/LandingPage";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import EstimateForm from "@/pages/estimate";
import Admin from "@/pages/admin";
import Results from "@/pages/results";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/home" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/estimate" component={EstimateForm} />
      <Route path="/admin" component={Admin} />
      <Route path="/results/:id" component={Results} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
