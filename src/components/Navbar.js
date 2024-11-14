"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { signOut, useSession } from "next-auth/react";
import { FaSignInAlt, FaUserPlus, FaBars, FaTimes } from "react-icons/fa";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession(); // Oturum bilgilerini al

  return (
    <nav className="bg-secondary p-5 px-4 md:px-16">
      <div className="flex container mx-auto justify-between items-center">
        {/* Logo-isim */}
        <div className="flex items-center space-x-2">
          <Link href="/">
            <span className="text-primary font-extrabold text-xl">İngilizce Sesli Asistan</span>
          </Link>
        </div>

        {/* Menü Linkleri */}
        <div className="hidden md:flex space-x-6 text-white text-sm">
          <Link href="/">
            <span className="hover:text-primary">Ana Sayfa</span>
          </Link>
          <Link href="/">
            <span className="hover:text-primary">Hakkımızda</span>
          </Link>
          <Link href="/">
            <span className="hover:text-primary">Yardım</span>
          </Link>
        </div>

        {/* Kullanıcı Girişi Kontrolü */}
        <div className="hidden md:flex space-x-4 text-sm">
          {session ? (
            <div className="flex items-center space-x-4">
              <span className="text-white">{session.user.email}</span>
              <button
                onClick={() => signOut()}
                className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-700 transition"
              >
                Çıkış Yap
              </button>
            </div>
          ) : (
            <>
              <div className="bg-btnprimary text-white px-4 gap-2 py-2 rounded-full hover:bg-blue-600 flex">
                <span className='flex justify-center items-center'>
                  <FaUserPlus />
                </span>
                <Link href="/RegisterPage">
                  <span>Kayıt Ol</span>
                </Link>
              </div>
              <div className="bg-btnsecondary text-white px-4 gap-2 py-2 rounded-full hover:bg-green-700 flex">
                <span className='flex justify-center items-center'>
                  <FaSignInAlt />
                </span>
                <Link href="/LoginPage">
                  <span>Giriş Yap</span>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white text-xl">
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col items-center space-y-4 mt-4 text-white text-sm">
          <Link href="/">
            <span className="hover:text-primary">Ana Sayfa</span>
          </Link>
          <Link href="/">
            <span className="hover:text-primary">Hakkımızda</span>
          </Link>
          <Link href="/">
            <span className="hover:text-primary">Yardım</span>
          </Link>
          {session ? (
            <div className="flex flex-col items-center space-y-2">
              <span className="text-white">{session.user.email}</span>
              <button
                onClick={() => signOut()}
                className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-700 transition"
              >
                Çıkış Yap
              </button>
            </div>
          ) : (
            <>
              <div className="bg-btnprimary text-white px-4 gap-2 py-2 rounded-full hover:bg-blue-600 flex">
                <span className='flex justify-center items-center'>
                  <FaUserPlus />
                </span>
                <Link href="/RegisterPage">
                  <span>Kayıt Ol</span>
                </Link>
              </div>
              <div className="bg-btnsecondary text-white px-4 gap-2 py-2 rounded-full hover:bg-green-700 flex">
                <span className='flex justify-center items-center'>
                  <FaSignInAlt />
                </span>
                <Link href="/LoginPage">
                  <span>Giriş Yap</span>
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
