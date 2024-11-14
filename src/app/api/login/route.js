import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export const POST = async (req) => {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-posta ve şifre alanları zorunludur." },
        { status: 400 }
      );
    }

    // Veritabanında kullanıcıyı email ile bul
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Bu e-posta ile kayıtlı kullanıcı bulunamadı." },
        { status: 404 }
      );
    }

    // Şifreyi doğrula
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: "Şifre hatalı." },
        { status: 401 }
      );
    }

    // Giriş başarılı ise kullanıcı bilgilerini döndür
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Giriş sırasında hata oluştu:", error);
    return NextResponse.json(
      { error: "Giriş işlemi başarısız." },
      { status: 500 }
    );
  }
};
