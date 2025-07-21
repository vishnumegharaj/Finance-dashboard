'use client'
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/app/lib/schema';
import { login } from '@/actions/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Chrome, ArrowRight } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { toast } from 'sonner';
import { z } from 'zod';

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const supabase = createClientComponentClient();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const [error, setError] = useState('');

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    try {
      const fd = new FormData();
      fd.append('email', data.email);
      fd.append('password', data.password);
      const response = await login(fd);
      if (!response.sucess) {
        toast.error(response.message);
        setError(response.message);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/dashboard' },
      });
      if (error) setError(error.message);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google login failed');
    }
  };

  return (
    <div className=" flex items-center justify-center align-middle bg-gray-50">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Log In</h1>
          <p className="text-muted-foreground">Welcome back! Please log in to continue.</p>
        </div>
        <Button
          variant="outline"
          className="w-full mb-6 flex items-center justify-center gap-3"
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          type="button"
        >
          <Chrome className="w-5 h-5" />
          Continue with Google
        </Button>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Input
              type="email"
              placeholder="Email"
              {...register('email')}
              aria-invalid={!!errors.email}
            />
            {errors.email && <span className="text-red-500 text-xs">{errors.email.message as string}</span>}
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              {...register('password')}
              aria-invalid={!!errors.password}
            />
            {errors.password && <span className="text-red-500 text-xs">{errors.password.message as string}</span>}
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Logging In...' : 'Log In'}
            <ArrowRight className="ml-2" />
          </Button>
        </form>
        <div className="text-center mt-6">
          <p className="text-muted-foreground text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" prefetch={true} className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
