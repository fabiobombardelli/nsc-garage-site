import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { adminAuth } from "@/features/scheduling";
import { AdminAgenda } from "@/features/scheduling/components/admin/AdminAgenda";
import { AdminLogin } from "@/features/scheduling/components/admin/AdminLogin";

/** Leva o foco ao título da tela depois de entrar ou sair (a tela muda inteira). */
const focusTitle = () =>
  requestAnimationFrame(() => document.querySelector<HTMLElement>("[data-page-title]")?.focus());

/** Painel da oficina (UC-17 Gerenciar Agenda), atrás da tela de acesso (RF-022). */
export function AdminPage() {
  /** `null` enquanto confere se já existe uma sessão aberta. */
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    adminAuth.isSignedIn().then(
      (result) => active && setSignedIn(result),
      () => active && setSignedIn(false),
    );
    return () => {
      active = false;
    };
  }, []);

  if (signedIn === null) {
    return (
      <div className="page container-site">
        <PageHeader title="Painel da oficina" lead="Conferindo o acesso…" />
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="page container-site">
        <PageHeader title="Painel da oficina" lead="Área restrita à equipe da NSC Garage." />
        <AdminLogin
          onSignedIn={() => {
            setSignedIn(true);
            focusTitle();
          }}
        />
      </div>
    );
  }

  return (
    <div className="page container-site">
      <PageHeader
        title="Agenda da oficina"
        lead="Confirme os pedidos, acompanhe os atendimentos e avise cada cliente pelo WhatsApp."
        actions={
          <button
            type="button"
            className="button button-small button-outline"
            onClick={async () => {
              await adminAuth.signOut();
              setSignedIn(false);
              focusTitle();
            }}
          >
            <LogOut size={16} aria-hidden="true" />
            Sair
          </button>
        }
      />
      <AdminAgenda />
    </div>
  );
}
