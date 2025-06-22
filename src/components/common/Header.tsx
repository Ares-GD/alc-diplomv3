"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaUser,
  FaBox,
  FaCapsules,
  FaListUl,
  FaShoppingCart,
  FaBars,
  FaSignOutAlt,
  FaTachometerAlt,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

interface MenuItem {
  icon: string;
  text: string;
  href: string;
  roles?: string[];
}

export default function Header() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const HEADER_LINKS = {
    home: "/",
    cart: "/cart",
    logout: "/auth/logout",
    menuItems: [
      {
        icon: "FaUser",
        text: "Профиль",
        href: "/profile",
      },
      {
        icon: "FaCapsules",
        text: "Продукция",
        href: "/products",
      },
      {
        icon: "FaBox",
        text: "Упаковки",
        href: "/packings",
      },
      {
        icon: "FaListUl",
        text: "Заявки",
        href: "/orders",
        roles: ["user"],
      },
      {
        icon: "FaTachometerAlt",
        text: "Панель администратора",
        href: "/admin/dashboard",
        roles: ["director",`manager`, 'stmanager'],
      },
    ],
  };

  useEffect(() => {
    if (status === "authenticated" && session.user?.role === "director") {
      // Логика для директора
    }
  }, [status, session, router]);

  const getIconForMenuItem = (iconName: string) => {
    switch (iconName) {
      case "FaUser":
        return <FaUser className="min-w-[24px]" />;
      case "FaBox":
        return <FaBox className="min-w-[24px]" />;
      case "FaCapsules":
        return <FaCapsules className="min-w-[24px]" />;
      case "FaListUl":
        return <FaListUl className="min-w-[24px]" />;
      case "FaShoppingCart":
        return <FaShoppingCart className="min-w-[24px]" />;
      case "FaTachometerAlt":
        return <FaTachometerAlt className="min-w-[24px]" />;
      default:
        return null;
    }
  };

  const filteredMenuItems = HEADER_LINKS.menuItems
      .filter((item: MenuItem) => {
        if (item.text === "Профиль") return status === "authenticated";
        if (item.roles && session?.user?.role)
          return item.roles.includes(session.user.role);
        return true;
      })
      .filter(Boolean);

  const handleMenuItemClick = () => setIsMobileMenuOpen(false);

  const handleAuthAction = () => {
    if (status === "authenticated")
      signOut({ callbackUrl: HEADER_LINKS.home });
  };

  return (
      <div>
        <header className="bg-dark fixed top-0 left-0 right-0 z-50 shadow-lg">
          {/* Основная панель */}
          <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
            {/* Логотип */}
            <Link href={HEADER_LINKS.home} className="flex items-center flex-shrink-0">
              <img
                  src="/images/alc-logo.svg"
                  alt="Логотип"
                  className="h-6 md:h-8 w-auto transition-all duration-300"
                  onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </Link>

            {/* Десктоп меню */}
            <nav className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8 ml-4">
              {filteredMenuItems.map((item, index) => (
                  <Link
                      key={index}
                      href={item.href}
                      className="flex items-center gap-2 text-white hover:text-accent transition-colors group"
                      aria-label={item.text}
                  >
                <span className="text-xl transition-colors">
                  {getIconForMenuItem(item.icon)}
                </span>
                    <span className="hidden lg:inline text-sm xl:text-base">
                  {item.text}
                </span>
                  </Link>
              ))}
            </nav>

            {/* Правая секция */}
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
              {status === "authenticated" && (
                  <div className="text-white text-sm flex items-center gap-2">
                <span
                    className={`${
                        session.user?.role === "director"
                            ? "text-green-400"
                            : session.user?.role === "manager"
                                ? "text-blue-400"
                                : session.user?.role === "stmanager"
                                    ? "text-purple-400"
                                    : "text-green-400"
                    } font-medium truncate max-w-[120px] xl:max-w-none`}
                >
                  {session.user?.role === "director"
                      ? "Директор"
                      : session.user?.role === "manager"
                          ? "Менеджер"
                          : session.user?.role === "stmanager"
                              ? "Ст. менеджер"
                              : ""}
                </span>
                  </div>
              )}

              {/* Скрытие корзины для директоров */}
              {!(status === "authenticated" && session.user?.role === "director") && (
                  <Link
                      href={HEADER_LINKS.cart}
                      className="relative p-2 hover:bg-gray-800 rounded-full transition-colors"
                      aria-label="Корзина"
                  >
                    <FaShoppingCart className="text-2xl text-white" />
                  </Link>
              )}

              {status === "authenticated" ? (
                  <button
                      onClick={handleAuthAction}
                      className="flex items-center gap-2 text-white rounded transition-colors"
                      aria-label="Выход"
                  >
                    <FaSignOutAlt className="text-lg flex-shrink-0" />
                  </button>
              ) : (
                  <button
                      onClick={handleAuthAction}
                      className="flex items-center gap-2 px-2 py-2 lg:px-2 lg:py-2 hover:bg-accent-dark text-white rounded transition-colors"
                      aria-label=""
                  >
                    <Link
                        href="/login"
                        className="relative p-2"
                        aria-label="Вход"
                    >
                      <FaUser className="text-lg flex-shrink-0" />
                    </Link>
                  </button>
              )}
            </div>

            {/* Мобильное меню */}
            <div className="md:hidden flex items-center gap-4">
              {/* Скрытие корзины для директоров */}
              {!(status === "authenticated" && session.user?.role === "director") && (
                  <Link
                      href={HEADER_LINKS.cart}
                      className="relative p-2"
                      aria-label="Корзина"
                  >
                    <FaShoppingCart className="text-2xl text-white" />
                  </Link>
              )}

              <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-white text-2xl p-2 hover:bg-gray-800 rounded-full transition-colors"
                  aria-label="Меню"
              >
                <FaBars />
              </button>
            </div>
          </div>

          {/* Мобильное меню */}
          <div
              className={`md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
                  isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
                className={`absolute top-16 left-0 right-0 bg-dark shadow-lg transform transition-transform duration-300 ${
                    isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
                }`}
            >
              <div className="p-4 space-y-2">
                {filteredMenuItems.map((item, index) => (
                    <Link
                        key={index}
                        href={item.href}
                        onClick={handleMenuItemClick}
                        className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-800 transition-colors"
                        aria-label={item.text}
                    >
                  <span className="text-xl text-gray-300">
                    {getIconForMenuItem(item.icon)}
                  </span>
                      <span className="text-white text-lg">{item.text}</span>
                    </Link>
                ))}

                {status === "authenticated" && (
                    <div className="px-4 py-3 bg-gray-800 rounded-lg mt-2">
                      <p
                          className={`${
                              session.user?.role === "director"
                                  ? "text-green-400"
                                  : session.user?.role === "manager"
                                      ? "text-blue-400"
                                      : session.user?.role === "stmanager"
                                          ? "text-purple-400"
                                          : "text-green-400"
                          } font-medium truncate`}
                      >
                        {session.user?.role === "director"
                            ? "Директор"
                            : session.user?.role === "manager"
                                ? "Менеджер"
                                : session.user?.role === "stmanager"
                                    ? "Ст. менеджер"
                                    : ""}
                      </p>
                    </div>
                )}

                <div className="border-t border-gray-800 my-2"></div>

                {status === "authenticated" ? (
                    <button
                        onClick={handleAuthAction}
                        className="w-full flex items-center gap-4 p-4 text-white bg-accent hover:bg-red-700 rounded-lg transition-colors"
                        aria-label="Выход"
                    >
                      <FaSignOutAlt className="text-xl" />
                      <span>Выход</span>
                    </button>
                ) : (
                    <Link
                        href="/api/auth/signin"
                        onClick={handleMenuItemClick}
                        className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-gray-800 transition-colors"
                        aria-label="Войти"
                    >
                      <FaUser className="text-xl text-gray-300" />
                      <span className="text-white">Войти</span>
                    </Link>
                )}
              </div>
            </div>
          </div>
        </header>
        <div className="h-16"></div>
      </div>
  );
}