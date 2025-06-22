'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { MenuIcon, XIcon } from 'lucide-react';

// Конфигурация навигационных ссылок
const NAV_LINKS = [
  { href: '/', text: 'Вернуться на сайт', roles: ['manager', 'stmanager', 'director'] },
  { href: '/admin/products', text: 'Продукция', roles: ['stmanager', 'director'] },
  { href: '/admin/packings', text: 'Упаковки', roles: ['stmanager', 'director'] },
  { href: '/admin/categories', text: 'Категории', roles: ['stmanager', 'director'] },
  { href: '/admin/users', text: 'Пользователи', roles: ['director'] },
  { href: '/admin/orders', text: 'Заявки', roles: ['manager', 'stmanager', 'director'] },
  { href: '/admin/questions', text: 'Вопросы', roles: ['manager', 'stmanager', 'director'] },
];

// Компонент ссылки для десктопного меню
const DesktopNavItem = ({ href, text, onClick }: { href: string; text: string; onClick?: () => void }) => (
    <Link
        href={href}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-white hover:text-[var(--color-accent)] transition-colors duration-200"
        onClick={onClick}
    >
      {text}
    </Link>
);

// Компонент ссылки для мобильного меню
const MobileNavItem = ({ href, text, onClick }: { href: string; text: string; onClick: () => void }) => (
    <Link
        href={href}
        className="block pl-3 pr-4 py-2 text-base font-medium text-white hover:bg-[var(--color-gray)] hover:text-[var(--color-accent)]"
        onClick={onClick}
    >
      {text}
    </Link>
);

export default function AdminHeader() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const role = session?.user?.role || '';
  const filteredLinks = NAV_LINKS.filter(link => link.roles.includes(role));

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
      <header className="bg-[var(--color-dark)] shadow-lg border-b border-[var(--color-gray)]">
        <div className="bg-red-900 text-white text-center py-2 font-bold text-sm md:text-base">
          ВЫ НАХОДИТЕСЬ В АДМИН-ПАНЕЛИ
        </div>

        <nav className="max-w-7xl mx-auto">
          <div className="flex justify-between h-16 items-center px-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-xl font-bold text-[var(--color-accent)]">Админ-панель</span>
              </div>

              {/* Десктопное меню */}
              <div className="hidden md:ml-6 md:flex md:space-x-1">
                {filteredLinks.map(link => (
                    <DesktopNavItem
                        key={link.href}
                        href={link.href}
                        text={link.text}
                    />
                ))}
              </div>
            </div>

            <div className="flex items-center">
              {session && (
                  <div className="hidden md:flex items-center">
                <span className="text-sm text-white mr-4">
                  {session.user?.email} | {role}
                </span>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-700 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
                    >
                      Выход
                    </button>
                  </div>
              )}

              {/* Кнопка мобильного меню */}
              <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden ml-4 p-2 rounded-md text-white hover:bg-[var(--color-gray)]"
              >
                {isMobileMenuOpen ? (
                    <XIcon className="h-6 w-6" />
                ) : (
                    <MenuIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Мобильное меню */}
          {isMobileMenuOpen && (
              <div className="md:hidden">
                <div className="pt-2 pb-3 space-y-1">
                  {filteredLinks.map(link => (
                      <MobileNavItem
                          key={link.href}
                          href={link.href}
                          text={link.text}
                          onClick={closeMobileMenu}
                      />
                  ))}

                  {session && (
                      <div className="pt-4 border-t border-[var(--color-gray)] px-3">
                        <div className="text-sm text-white mb-2">
                          {session.user?.email} | {role}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 bg-red-700 text-white rounded-md text-sm font-medium hover:bg-red-600"
                        >
                          Выйти
                        </button>
                      </div>
                  )}
                </div>
              </div>
          )}
        </nav>
      </header>
  );
}