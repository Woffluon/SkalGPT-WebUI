'use client';

import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Ad en az 2 karakter olmalıdır.' }),
  surname: z.string().min(2, { message: 'Soyad en az 2 karakter olmalıdır.' }),
  email: z.string().email({ message: 'Geçerli bir e-posta adresi girin.' }),
  password: z.string().min(6, { message: 'Şifre en az 6 karakter olmalıdır.' }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailValidationError, setEmailValidationError] = useState<string | null>(null); // Yeni state
  const supabase = createClient();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      surname: '',
      email: '',
      password: '',
    },
  });

  // Yeni fonksiyon: E-posta doğrulaması
  const validateEmail = async (email: string) => {
    setEmailValidationError(null);
    if (!email) {
      return true;
    }
    try {
      const response = await fetch('/api/validate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        setEmailValidationError(data.error || 'E-posta doğrulanırken bir hata oluştu.');
        return false;
      }
      return true;
    } catch (error) {
      console.error('API çağrısı hatası:', error);
      setEmailValidationError('E-posta doğrulanırken bir hata oluştu.');
      return false;
    }
  };

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    setSuccessMessage(null);
    setEmailValidationError(null); // Submit öncesi hataları temizle

    // Yeni API rotasını çağır
    const isEmailValid = await validateEmail(values.email);
    if (!isEmailValid) {
      return; // Eğer e-posta geçerli değilse formu submit etme
    }

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          name: values.name,
          surname: values.surname,
        },
      },
    });

    if (error) {
      console.error('Supabase kayıt hatası:', error);
      setServerError(error.message);
    } else {
      setSuccessMessage('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
      form.reset();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Yeni Hesap Oluştur</CardTitle>
          <CardDescription>
            Başlamak için bilgilerinizi girin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad</FormLabel>
                      <FormControl>
                        <Input placeholder="Adınız" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="surname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Soyad</FormLabel>
                      <FormControl>
                        <Input placeholder="Soyadınız" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ornek@mail.com"
                        {...field}
                        onBlur={(e) => { // onBlur ekle
                          field.onBlur();
                          validateEmail(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    {emailValidationError && ( // Hata mesajını göster
                      <p className="text-sm font-medium text-destructive mt-1">
                        {emailValidationError}
                      </p>
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şifre</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {serverError && <p className="text-sm font-medium text-destructive">{serverError}</p>}
              {successMessage && (
                <Alert variant="default">
                  <AlertTitle>Başarılı!</AlertTitle>
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Hesap oluşturuluyor...' : 'Hesap Oluştur'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Zaten bir hesabınız var mı?{' '}
            <Link href="/auth/login" className="underline text-primary">
              Giriş Yapın
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 