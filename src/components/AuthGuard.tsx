import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ALLOWED_EMAILS = [
  "suporte@gmail.com",
  "marcondesgestaotrafego@gmail.com",
];

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  const checkAccess = async (email: string | undefined) => {
    if (!email || !ALLOWED_EMAILS.includes(email.toLowerCase())) {
      toast.error("⛔ Acesso negado! Email não autorizado.");
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      navigate("/login");
      return false;
    }
    return true;
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const allowed = await checkAccess(session.user.email);
        if (allowed) setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        navigate("/login");
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        setIsAuthenticated(false);
        navigate("/login");
      } else {
        const allowed = await checkAccess(session.user.email);
        if (allowed) setIsAuthenticated(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
};

export default AuthGuard;
