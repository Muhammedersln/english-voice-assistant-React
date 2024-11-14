// pages/login.js
"use client";
import { signIn } from "next-auth/react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res.ok) {
      toast.success("Giriş başarılı!"); // Show success toast
      router.push("/"); // Redirect to the home page
    } else {
      toast.error("Giriş başarısız. E-posta veya şifre hatalı."); // Show error toast
    }
  };

  return (
    <div>
      <Navbar />
      <Toaster position="top-center" reverseOrder={false} /> {/* Toaster for toast notifications */}
      <div className="flex items-center justify-center min-h-screen bg-bgpage px-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Giriş Yap</h2>
          <div className="flex flex-col gap-2 mb-4">
            <label className="text-gray-200">E-posta</label>
            <input
              type="email"
              placeholder="E-posta"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-500 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
            />
          </div>
          <div className="flex flex-col gap-2 mb-4">
            <label className="text-gray-200">Şifre</label>
            <input
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-500 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
            />
          </div>
          <button
            onClick={handleLogin}
            className="w-full bg-primary text-black p-3 rounded hover:bg-yellow-600 transition font-semibold"
          >
            Giriş Yap
          </button>
          <p className="text-center text-gray-400 mt-6">
            Hesabınız yok mu?{" "}
            <Link href="/RegisterPage" className="text-yellow-500 hover:underline">
              Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;
