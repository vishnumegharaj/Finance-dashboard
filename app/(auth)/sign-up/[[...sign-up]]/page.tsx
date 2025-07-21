'use client'
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '@/app/lib/schema';
import { signup } from '@/actions/auth';
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/dashboard' }
      });
      if (error) setError(error.message);
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
