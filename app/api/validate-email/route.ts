import { NextRequest, NextResponse } from 'next/server';
import { isDisposableEmail } from '@/lib/email-validation';
import { promises as dns } from 'dns'; // Yeni import

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: 'E-posta adresi gerekli.' }, { status: 400 });
  }

  // DEA kontrolü
  if (isDisposableEmail(email)) {
    return NextResponse.json({ isValid: false, error: 'Tek kullanımlık e-posta adresleri kabul edilmemektedir.' }, { status: 400 });
  }

  // DNS MX kaydı kontrolü
  const domain = email.split('@')[1];
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (mxRecords.length === 0) {
      return NextResponse.json({ isValid: false, error: 'E-posta adresi etki alanı geçerli değil (MX kaydı bulunamadı).' }, { status: 400 });
    }
  } catch (error) {
    console.error(`MX kaydı sorgulama hatası for ${domain}:`, error);
    return NextResponse.json({ isValid: false, error: 'E-posta etki alanı doğrulanamadı. Lütfen geçerli bir e-posta girin.' }, { status: 400 });
  }

  return NextResponse.json({ isValid: true });
} 