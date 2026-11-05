import { KeyRound } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { Field } from "@/components/forms/Field";
import { adminAuth } from "../..";

/**
 * Tela de acesso do painel (RF-022). Os campos aceitam colar e
 * gerenciadores de senha (`autocomplete`): nada de quebra-cabeça ou cópia
 * de caracteres (WCAG 3.3.8, novo na 2.2). Online, o acesso é e-mail e
 * senha do Supabase; na demonstração, só a senha.
 */
export function AdminLogin({ onSignedIn }: { onSignedIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    const result = await adminAuth.signIn({ email, password });
    setBusy(false);
    if (result.ok) {
      onSignedIn();
      return;
    }
    setError(result.message);
    (adminAuth.usesEmail && !email.trim() ? emailRef : passwordRef).current?.focus();
  };

  return (
    <form className="admin-login" noValidate onSubmit={handleSubmit}>
      <h2 className="admin-login-title">Acesso da equipe</h2>
      {adminAuth.usesEmail && (
        <Field id="painel-email" label="E-mail">
          {(control) => (
            <input
              {...control}
              ref={emailRef}
              type="email"
              inputMode="email"
              autoComplete="username"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError(undefined);
              }}
            />
          )}
        </Field>
      )}
      <Field id="painel-senha" label="Senha de acesso" error={error}>
        {(control) => (
          <input
            {...control}
            ref={passwordRef}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError(undefined);
            }}
          />
        )}
      </Field>
      <button type="submit" className="button" aria-disabled={busy || undefined}>
        <KeyRound size={18} aria-hidden="true" />
        {busy ? "Entrando…" : "Entrar no painel"}
      </button>
      {!adminAuth.usesEmail && (
        <p className="form-note">
          Demonstração: a senha está no README do projeto. No site online, o acesso é feito por
          e-mail e senha, conferidos no servidor.
        </p>
      )}
    </form>
  );
}
