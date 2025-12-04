import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth"; // Importar a página de autenticação
import { ThemeProvider } from "@/components/theme-provider";
import { supabase } from "@/lib/supabase"; // Importar o cliente Supabase
import React, { useState, useEffect } from "react"; // Importar useState e useEffect

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>(null); // Estado para a sessão do usuário
  const navigate = useNavigate(); // Hook para navegação

  useEffect(() => {
    // Verifica a sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth"); // Redireciona para auth se não houver sessão
      }
    });

    // Escuta mudanças no estado de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (event === "SIGNED_OUT" || !session) {
          navigate("/auth"); // Redireciona para auth ao deslogar
        } else if (event === "SIGNED_IN" && session) {
          navigate("/"); // Redireciona para a página principal ao logar
        }
      }
    );

    return () => {
      authListener?.unsubscribe(); // Limpa o listener ao desmontar
    };
  }, [navigate]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" attribute="class">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {/* BrowserRouter já está aqui, não precisa de outro */}
          <Routes>
            <Route path="/auth" element={<Auth />} /> {/* Rota para autenticação */}
            {session ? ( // Rotas protegidas
              <Route path="/" element={<Index />} />
            ) : (
              // Se não houver sessão, redireciona para /auth (já feito no useEffect)
              // Ou pode renderizar um spinner/loading aqui
              <Route path="/" element={<Auth />} />
            )}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;