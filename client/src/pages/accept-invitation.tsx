import { useState, useEffect } from 'react';
import { useLocation, useRoute, Link } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { validateInvitationToken, acceptInvitation } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';

// Schema for the password form
const passwordSchema = z.object({
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(100),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function AcceptInvitationPage() {
  // State to track invitation validation
  const [tokenIsValid, setTokenIsValid] = useState<boolean | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  // Get the token from the URL query
  const [, params] = useRoute('/accept-invitation');
  const [location, setLocation] = useLocation();
  
  // Extract token on initial load directly from window.location
  useEffect(() => {
    const currentUrl = window.location.href;
    console.log('Full URL:', currentUrl);
    
    const tokenMatch = currentUrl.match(/[?&]token=([^&]*)/);
    if (tokenMatch && tokenMatch[1]) {
      const directToken = decodeURIComponent(tokenMatch[1]);
      console.log('Token extracted directly:', directToken);
      setToken(directToken);
      
      // Validate the token immediately
      const validateToken = async (tokenToValidate: string) => {
        try {
          const response = await validateInvitationToken(tokenToValidate);
          if (response.valid) {
            setTokenIsValid(true);
            setUsername(response.username || '');
          } else {
            setTokenIsValid(false);
            setValidationError(response.message || 'Invalid invitation token');
          }
        } catch (error) {
          setTokenIsValid(false);
          setValidationError('Error validating invitation token');
          console.error('Token validation error:', error);
        }
      };
      
      validateToken(directToken);
    }
  }, []);
  const { toast } = useToast();
  
  // Form setup
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Mutation for accepting the invitation
  const acceptMutation = useMutation({
    mutationFn: async ({ token, password }: { token: string; password: string }) => {
      return await acceptInvitation(token, password);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Your account has been activated. Welcome!',
      });
      setLocation('/');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to accept invitation',
        variant: 'destructive',
      });
    },
  });

  // Effect to get and validate the token from the URL
  useEffect(() => {
    // More robust URL parsing
    const queryString = location.includes('?') ? location.split('?')[1] : '';
    const searchParams = new URLSearchParams(queryString);
    const tokenFromUrl = searchParams.get('token');
    
    console.log('URL location:', location);
    console.log('Query string:', queryString);
    console.log('Token from URL:', tokenFromUrl);
    
    if (!tokenFromUrl) {
      setTokenIsValid(false);
      setValidationError('No invitation token provided');
      return;
    }
    
    setToken(tokenFromUrl);
    
    // Validate the token
    const validateToken = async () => {
      try {
        const response = await validateInvitationToken(tokenFromUrl);
        
        if (response.valid) {
          setTokenIsValid(true);
          setUsername(response.username || '');
        } else {
          setTokenIsValid(false);
          setValidationError(response.message || 'Invalid invitation token');
        }
      } catch (error) {
        setTokenIsValid(false);
        setValidationError('Error validating invitation token');
        console.error('Token validation error:', error);
      }
    };
    
    validateToken();
  }, [location]);

  // Handle form submission
  const onSubmit = (values: PasswordFormValues) => {
    if (token) {
      acceptMutation.mutate({ token, password: values.password });
    }
  };

  // Show loading state while validating token
  if (tokenIsValid === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>Validating Invitation</CardTitle>
            <CardDescription>Please wait while we validate your invitation...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if token is invalid
  if (tokenIsValid === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md shadow-lg border-destructive">
          <CardHeader className="text-center">
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription className="text-destructive">
              {validationError || 'The invitation token is invalid or has expired.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">Please contact an administrator for a new invitation.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link to="/auth">Go to Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Show password form if token is valid
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle>Complete Your Registration</CardTitle>
          <CardDescription>
            Welcome, {username}! Please set a password to activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter a secure password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full" 
                disabled={acceptMutation.isPending}
              >
                {acceptMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up your account...
                  </>
                ) : (
                  'Activate Account'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}