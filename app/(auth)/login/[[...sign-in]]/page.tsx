'use client'
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/app/lib/schema';
import { login, signInWithGoogle } from '@/actions/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Chrome, ArrowRight, EyeOff, Eye } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { toast } from 'sonner';
import { z } from 'zod';

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const supabase = createClientComponentClient();
  const [showPassword, setShowPassword] = useState(false);
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
      const response = await signInWithGoogle();
      console.log("response google login", response);
      if (!response.sucess) {
        toast.error(response.message);
        setError(response.message);
      }
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
          <svg xmlns="http://www.w3.org/2000/svg" className="size-6" viewBox="0 0 48 48">
            <path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
          </svg>
          Continue with Google
        </Button>

        {/* divider  */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-background text-muted-foreground">Or continue with email</span>
          </div>
        </div>

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
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              {...register('password')}
              aria-invalid={!!errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
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
