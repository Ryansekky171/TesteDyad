import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { ThemeProvider } from "@/components/theme-provider";
import { supabase } from "@/lib/supabase";
import React, { useState, useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true); // Adicionar estado de carregamento
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (!session) {
          navigate("/auth", { replace: true }); // Redireciona para auth se não houver sessão
        }
      } catch (error) {
        console.error("Erro ao verificar sessão Supabase:", error);
        // Em caso de erro, redireciona para a página de autenticação
        navigate("/auth", { replace: true });
      } finally {
        setLoading(false); // Garante que o loading seja falso após a verificação inicial
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (event === "SIGNED_OUT" || !session) {
          navigate("/auth", { replace: true }); // Redireciona para auth ao deslogar
        } else if (event === "SIGNED_IN" && session) {
          navigate("/", { replace: true }); // Redireciona para a página principal ao logar
        }
      }
    );

    return () => {
      authListener?.unsubscribe(); // Limpa o listener ao desmontar
    };
  }, [navigate]);

  if (loading) {
    // Renderiza um spinner ou mensagem de carregamento enquanto verifica a sessão
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-lg font-medium">Carregando autenticação...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" attribute="class">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            {session ? (
              <Route path="/" element={<Index />} />
            ) : (
              // Se não houver sessão e não estiver carregando, o useEffect já redirecionou para /auth.
              // Esta rota de fallback garante que se o usuário tentar acessar / diretamente sem sessão,
              // ele será levado para a página de autenticação.
              <Route path="/" element={<Auth />} />
            )}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;