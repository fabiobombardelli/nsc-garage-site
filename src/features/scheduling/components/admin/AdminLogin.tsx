import { KeyRound } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { Field } from "@/components/forms/Field";
import { signIn } from "../../services/adminAuth";

/**
 * Tela de acesso do painel (RF-022). O campo de senha aceita colar e
 * gerenciadores de senha (`autocomplete="current-password"`): nada de
 * quebra-cabeça ou cópia de caracteres (WCAG 3.3.8, novo na 2.2).
 */
export function AdminLogin({ onSignedIn }: { onSignedIn: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    const result = await signIn(password);
    setBusy(false);
    if (result.ok) {
      onSignedIn();
      return;
    }
    setError(result.message);
    inputRef.current?.focus();
  };

  return (
    <form className="admin-login" noValidate onSubmit={handleSubmit}>
      <h2 className="admin-login-title">Acesso da equipe</h2>
      <Field id="painel-senha" label="Senha de acesso" error={error}>
        {(control) => (
          <input
            {...control}
            ref={inputRef}
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
        Entrar no painel
      </button>
      <p className="form-note">
        Protótipo acadêmico: a senha de demonstração está no README do projeto. Em produção, o
        acesso será verificado no servidor.
      </p>
    </form>
  );
}
