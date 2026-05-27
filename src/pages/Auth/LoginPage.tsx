import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthForm } from '../../components/AuthForm/AuthForm';
import { FormField } from '../../components/FormField/FormField';
import { useAuth } from '../../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'No se pudo iniciar sesion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Inicia sesion"
      subtitle="Vuelve a tus gastos, metas y reportes personales."
      submitLabel="Iniciar sesion"
      error={error}
      loading={loading}
      footer={
        <>
          No tienes cuenta? <Link to="/register">Crear cuenta</Link>
        </>
      }
      onSubmit={handleSubmit}
    >
      <FormField label="Email" name="email" type="email" value={email} required onChange={setEmail} />
      <FormField label="Password" name="password" type="password" value={password} required onChange={setPassword} />
    </AuthForm>
  );
}
