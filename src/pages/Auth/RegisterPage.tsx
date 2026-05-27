import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthForm } from '../../components/AuthForm/AuthForm';
import { FormField } from '../../components/FormField/FormField';
import { useAuth } from '../../context/AuthContext';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, fullName);
      navigate('/dashboard', { replace: true });
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'No se pudo crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Crea tu cuenta"
      subtitle="Guarda tus finanzas reales con seguridad por usuario."
      submitLabel="Crear cuenta"
      error={error}
      loading={loading}
      footer={
        <>
          Ya tienes cuenta? <Link to="/login">Iniciar sesion</Link>
        </>
      }
      onSubmit={handleSubmit}
    >
      <FormField label="Nombre" name="fullName" value={fullName} required onChange={setFullName} />
      <FormField label="Email" name="email" type="email" value={email} required onChange={setEmail} />
      <FormField label="Password" name="password" type="password" value={password} required onChange={setPassword} />
      <FormField
        label="Confirmar password"
        name="confirmPassword"
        type="password"
        value={confirmPassword}
        required
        onChange={setConfirmPassword}
      />
    </AuthForm>
  );
}
