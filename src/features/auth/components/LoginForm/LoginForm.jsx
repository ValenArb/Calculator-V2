import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { signIn, signInWithGoogle, clearError } from '../../../../store/slices/authSlice';
import { Button, Input } from '../../../../components/ui';
import toast from 'react-hot-toast';

const LoginForm = ({ onSwitchToRegister }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await dispatch(signIn(data)).unwrap();
      toast.success('¡Bienvenido!');
    } catch (error) {
      toast.error(error || 'Error al iniciar sesión');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await dispatch(signInWithGoogle()).unwrap();
      toast.success('¡Bienvenido!');
    } catch (error) {
      toast.error(error || 'Error al iniciar sesión con Google');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Iniciar Sesión</h2>
        <p className="mt-2 text-gray-600">Accede a tu cuenta de Calculadora Eléctrica</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Correo electrónico"
          type="email"
          {...register('email', { 
            required: 'El correo es requerido',
            pattern: {
              value: /^\S+@\S+$/i,
              message: 'Formato de correo inválido'
            }
          })}
          error={errors.email?.message}
        />

        <Input
          label="Contraseña"
          type="password"
          {...register('password', { 
            required: 'La contraseña es requerida',
            minLength: {
              value: 6,
              message: 'La contraseña debe tener al menos 6 caracteres'
            }
          })}
          error={errors.password?.message}
        />

        <Button
          type="submit"
          className="w-full"
          loading={loading}
          disabled={loading}
        >
          Iniciar Sesión
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">O continúa con</span>
          </div>
        </div>

        <Button
          variant="secondary"
          className="w-full mt-4"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </Button>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={() => window.location.href = '/calculator'}
          className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
        >
          Continuar sin iniciar sesión
        </button>
        <p className="mt-2 text-xs text-gray-500 text-center">
          Solo tendrás acceso a la calculadora (sin proyectos)
        </p>
      </div>

      <p className="mt-6 text-center text-sm text-gray-600">
        ¿No tienes una cuenta?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-semibold text-primary-600 hover:text-primary-500"
        >
          Regístrate
        </button>
      </p>
    </div>
  );
};

export default LoginForm;