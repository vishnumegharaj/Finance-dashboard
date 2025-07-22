'use client'
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '@/app/lib/schema';
import { signInWithGoogle, signup } from '@/actions/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, ArrowRight, Chrome } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import Link from 'next/link';
import { z } from 'zod';

type SignupFormData = z.infer<typeof signupSchema>;

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const supabase = createClientComponentClient();
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });
  const [error, setError] = useState('');

  const onSubmit = async (data: SignupFormData) => {
    setError('');
    try {
      const fd = new FormData();
      fd.append('name', data.name);
      fd.append('email', data.email);
      fd.append('password', data.password);
      const response = await signup(fd);
      if (!response.sucess) {
        toast.error(response.message);
        setError(response.message);
      } else {
        toast.success(
          `A confirmation email has been sent to ${data.email}. Please confirm your email`,
          { duration: 10000 }
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign up';
      setError(message);
      toast.error("Sign up failed!", { description: message, duration: 4000 });
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
      const message = err instanceof Error ? err.message : 'Google login failed';
      setError(message);
    }
  };

  return (
    <div className="flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-muted-foreground">Join us and start your journey today</p>
        </div>
        
        <Button
          variant="outline"
          className="w-full mb-6 flex items-center justify-center"
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
              placeholder="Full Name"
              {...register('name')}
              aria-invalid={!!errors.name}
            />
            {errors.name && <span className="text-red-500 text-xs">{errors.name.message as string}</span>}
          </div>
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
          <div className="relative">
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              {...register('confirmPassword')}
              aria-invalid={!!errors.confirmPassword}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            {errors.confirmPassword && <span className="text-red-500 text-xs">{errors.confirmPassword.message as string}</span>}
          </div>
          <div className="flex items-center space-x-2">
            <Controller
              name="terms"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="terms"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground">
              I agree to the Terms of Service and Privacy Policy
            </label>
          </div>
          {errors.terms && <span className="text-red-500 text-xs">{errors.terms.message as string}</span>}
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
            <ArrowRight className="ml-2" />
          </Button>
        </form>
        <div className="text-center mt-6">
          <p className="text-muted-foreground text-sm">
            Already have an account?{' '}
            <Link href="/login" prefetch className="text-primary hover:underline font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
