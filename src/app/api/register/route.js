import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const POST = async (req) => {
  try {
    const { name, email, password } = await req.json();

    // Tüm alanların doldurulduğunu kontrol et
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Tüm alanlar zorunludur." },
        { status: 400 }
      );
    }

    // Şifreyi hashleme
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcıyı veritabanına kaydetme
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword, // Hashlenmiş şifreyi kaydet
      },
    });

    return NextResponse.json({ user: newUser }, { status: 200 });
  } catch (error) {
    console.error("Kullanıcı kaydı sırasında hata oluştu:", error);
    return NextResponse.json(
      { error: "Kullanıcı kaydı başarısız." },
      { status: 500 }
    );
  }
};
