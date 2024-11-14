// pages/register.js
"use client";
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        toast.success("Kullanıcı başarıyla kaydedildi!"); // Success toast
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Kayıt başarısız. Lütfen tekrar deneyin."); 
      }
    } catch (error) {
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin."); // Error toast
    }
  };

  return (
    <div className="min-h-screen bg-bgpage">
      <Navbar /> {/* Navbar */}

      <Toaster position="top-center" reverseOrder={false} /> {/* Toaster for toast notifications */}

      <div className="flex items-center min-h-screen justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Kayıt Ol</h2>
          <div className="flex flex-col gap-2 mb-4">
            <label className="text-gray-300">Ad Soyad</label>
            <input
              type="text"
              placeholder="Adınızı girin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
            />
          </div>
          <div className="flex flex-col gap-2 mb-4">
            <label className="text-gray-300">E-posta</label>
            <input
              type="email"
              placeholder="E-posta adresinizi girin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
            />
          </div>
          <div className="flex flex-col gap-2 mb-4">
            <label className="text-gray-300">Şifre</label>
            <input
              type="password"
              placeholder="Şifrenizi girin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
            />
          </div>
          <button
            onClick={handleRegister}
            className="w-full bg-primary text-black p-3 rounded hover:bg-yellow-600 transition font-semibold"
          >
            Kayıt Ol
          </button>
          <p className="text-center text-gray-400 mt-6">
            Zaten hesabınız var mı? <Link href="/LoginPage" className="text-yellow-500 hover:underline">Giriş Yap</Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RegisterPage;
