"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IMaskInput } from 'react-imask';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

interface FormData {
  userType: 'individual' | 'legal_entity';
  companyName: string;
  inn: string;
  ogrn: string;
  ogrnip: string;
  kpp: string;
  legalAddress: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  agreement: boolean;
}

const RegisterPage = () => {
  // Состояния
  const [formData, setFormData] = useState<FormData>({
    userType: 'individual',
    companyName: '',
    inn: '',
    ogrn: '',
    ogrnip: '',
    kpp: '',
    legalAddress: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreement: false
  });

  const [errors, setErrors] = useState<Record<string, string | undefined>>({
    userType: undefined,
    companyName: undefined,
    inn: undefined,
    ogrn: undefined,
    ogrnip: undefined,
    kpp: undefined,
    legalAddress: undefined,
    email: undefined,
    password: undefined,
    confirmPassword: undefined,
    phone: undefined,
    agreement: undefined,
    form: undefined
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({
    userType: false,
    companyName: false,
    inn: false,
    ogrn: false,
    ogrnip: false,
    kpp: false,
    legalAddress: false,
    email: false,
    password: false,
    confirmPassword: false,
    phone: false,
    agreement: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Регулярное выражение для пароля
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{9,}$/;

  // Функция валидации поля
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'email':
        if (!value) return 'Email обязателен';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Неверный формат email';
        return undefined;
      case 'password':
        if (!value) return 'Пароль обязателен';
        if (!strongPasswordRegex.test(value)) return 'Пароль должен содержать: минимум 9 символов, заглавные/строчные латинские буквы, цифры и спецсимволы';
        return undefined;
      case 'confirmPassword':
        if (!value) return 'Подтвердите пароль';
        if (value !== formData.password) return 'Пароли не совпадают';
        return undefined;
      case 'phone':
        if (!value) return 'Телефон обязателен';
        const cleanedPhone = value.replace(/\D/g, '');
        if (cleanedPhone.length !== 11) return 'Номер телефона должен содержать 11 цифр';
        return undefined;
      case 'inn':
        if (!value) return 'ИНН обязателен';
        if (value.replace(/\D/g, '').length !== 10) return 'ИНН должен содержать 10 цифр';
        return undefined;
      case 'ogrn':
        if (formData.userType === 'legal_entity' && !value) return 'ОГРН обязателен';
        if (formData.userType === 'legal_entity' && value.replace(/\D/g, '').length !== 13) return 'ОГРН должен содержать 13 цифр';
        return undefined;
      case 'kpp':
        if (formData.userType === 'legal_entity' && !value) return 'КПП обязателен';
        if (formData.userType === 'legal_entity' && value.replace(/\D/g, '').length !== 9) return 'КПП должен содержать 9 цифр';
        return undefined;
      case 'ogrnip':
        if (formData.userType === 'individual' && !value) return 'ОГРНИП обязателен';
        if (formData.userType === 'individual' && value.replace(/\D/g, '').length !== 15) return 'ОГРНИП должен содержать 15 цифр';
        return undefined;
      case 'companyName':
        if (!value) return 'Название компании обязательно';
        return undefined;
      case 'legalAddress':
        if (!value) return 'Юридический адрес обязателен';
        return undefined;
      case 'agreement':
        if (!value) return 'Необходимо согласие на обработку данных';
        return undefined;
      default:
        return undefined;
    }
  };

  // Обработчики ввода
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({ ...prev, phone: value }));
    setTouched(prev => ({ ...prev, phone: true }));
  };

  const handleNumericChange = (name: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  // Обработчик для чекбокса
  const handleAgreementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, agreement: e.target.checked }));
    setTouched(prev => ({ ...prev, agreement: true }));
  };

  // Смена типа пользователя
  const handleTypeChange = (type: 'individual' | 'legal_entity') => {
    setFormData(prev => ({
      ...prev,
      userType: type,
      ...(type === 'legal_entity' ? { ogrnip: '', ogrn: '', kpp: '' } : { ogrn: '', kpp: '', ogrnip: '' })
    }));
    setTouched(prev => ({
      ...prev,
      ogrn: false,
      kpp: false,
      ogrnip: false
    }));
    setErrors(prev => ({
      ...prev,
      ogrn: undefined,
      kpp: undefined,
      ogrnip: undefined
    }));
  };

  // Валидация всех полей с debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const newErrors = { ...errors };
      (Object.keys(formData) as Array<keyof FormData>).forEach(field => {
        if (touched[field]) {
          newErrors[field] = validateField(field, formData[field]);
        }
      });
      setErrors(newErrors);
    }, 300);
    return () => clearTimeout(timer);
  }, [formData, touched]);

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allFields: Array<keyof FormData> = [
      'userType', 'companyName', 'inn', 'ogrn', 'ogrnip', 'kpp',
      'legalAddress', 'email', 'password', 'confirmPassword', 'phone', 'agreement'
    ];
    // Помечаем все поля как "потроганные"
    const newTouched = allFields.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Record<keyof FormData, boolean>);
    setTouched(newTouched);
    // Валидация
    const newErrors = allFields.reduce((acc, field) => {
      acc[field] = validateField(field, formData[field]);
      return acc;
    }, {} as Record<keyof FormData, string | undefined>);
    setErrors(newErrors);
    // Если есть ошибки — не отправляем
    if (Object.values(newErrors).some(error => error !== undefined)) return;
    // Отправка данных
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: formData.phone.replace(/\D/g, ''),
          inn: formData.inn.replace(/\D/g, ''),
          ogrn: formData.ogrn.replace(/\D/g, ''),
          ogrnip: formData.ogrnip.replace(/\D/g, ''),
          kpp: formData.kpp.replace(/\D/g, '')
        })
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || 'Ошибка регистрации');
      }
      window.location.href = '/login';
    } catch (error: any) {
      setErrors(prev => ({ ...prev, form: error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto]">
      <Header />
      <div className="grid place-items-center p-4">
        <div className="bg-dark p-8 rounded-lg shadow-md w-full max-w-lg duration-300 transition-all">
          <h2 className="text-2xl font-bold text-center text-white mb-6">Регистрация</h2>
          <form onSubmit={handleSubmit} className="grid gap-4">
            {/* Тип пользователя */}
            <div>
              <select
                name="userType"
                value={formData.userType}
                onChange={(e) => handleTypeChange(e.target.value as 'individual' | 'legal_entity')}
                className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)]"
              >
                <option value="individual">Индивидуальный предприниматель</option>
                <option value="legal_entity">Юридическое лицо</option>
              </select>
            </div>

            {/* Поля для юридического лица */}
            {formData.userType === 'legal_entity' && (
              <>
                <div>
                  <IMaskInput
                    mask="0000000000000" // 13 цифр
                    value={formData.ogrn}
                    onAccept={(value: string) => handleNumericChange('ogrn', value)}
                    placeholder="ОГРН (13 цифр)"
                    className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)]"
                  />
                  {touched.ogrn && errors.ogrn && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.ogrn}
                    </p>
                  )}
                </div>
                <div>
                  <IMaskInput
                    mask="000000000" // 9 цифр
                    value={formData.kpp}
                    onAccept={(value: string) => handleNumericChange('kpp', value)}
                    placeholder="КПП (9 цифр)"
                    className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)]"
                  />
                  {touched.kpp && errors.kpp && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.kpp}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Общие поля */}
            <div>
              <input
                type="text"
                name="companyName"
                placeholder="Название компании"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)]"
              />
              {touched.companyName && errors.companyName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.companyName}
                </p>
              )}
            </div>

            <div>
              <IMaskInput
                mask="+7(000) 000-00-00" // Обновленная маска для 11 цифр
                value={formData.phone}
                onAccept={handlePhoneChange}
                placeholder="Номер телефона"
                className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)]"
              />
              {touched.phone && errors.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <IMaskInput
                mask="0000000000" // ИНН (10 цифр)
                value={formData.inn}
                onAccept={(value: string) => handleNumericChange('inn', value)}
                placeholder="ИНН (10 цифр)"
                className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)]"
              />
              {touched.inn && errors.inn && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.inn}
                </p>
              )}
            </div>

            {/* Поля для ИП */}
            {formData.userType === 'individual' && (
              <div>
                <IMaskInput
                  mask="000000000000000" // ОГРНИП (15 цифр)
                  value={formData.ogrnip}
                  onAccept={(value: string) => handleNumericChange('ogrnip', value)}
                  placeholder="ОГРНИП (15 цифр)"
                  className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)]"
                />
                {touched.ogrnip && errors.ogrnip && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.ogrnip}
                  </p>
                )}
              </div>
            )}

            <div>
              <input
                type="text"
                name="legalAddress"
                placeholder="Юридический адрес"
                value={formData.legalAddress}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)]"
              />
              {touched.legalAddress && errors.legalAddress && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.legalAddress}
                </p>
              )}
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)]"
              />
              {touched.email && errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Пароль */}
            <div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Пароль"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)] pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-gray)] hover:text-[var(--color-accent)]"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7-1.926 7-9.542 7-9.542-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243" />
                  </svg>
                )}
              </button>
              {touched.password && errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Подтверждение пароля */}
            <div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Подтвердите пароль"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)] pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-gray)] hover:text-[var(--color-accent)]"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7-1.926 7-9.542 7-9.542-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243" />
                  </svg>
                )}
              </button>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Согласие на обработку данных */}
            <div className="grid grid-cols-[auto_1fr] items-center gap-x-2">
              <input
                type="checkbox"
                checked={formData.agreement}
                onChange={handleAgreementChange}
                className="rounded text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
              />
              <label htmlFor="agreement" className="text-sm text-[var(--color-gray)]">
                Даю согласие на обработку
                <a href="/policy" className="text-[var(--color-accent)] underline ml-1">
                  Политики конфиденциальности
                </a>
              </label>
            </div>
            {touched.agreement && errors.agreement && (
              <p className="text-red-500 text-sm mt-1">
                {errors.agreement}
              </p>
            )}

            {/* Кнопка регистрации */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-[var(--color-accent)] text-white py-2 px-4 rounded transition focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-opacity-50 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:brightness-90'
              }`}
            >
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>

            {/* Ссылка на вход */}
            <div className="mt-4 text-center text-[var(--color-gray)]">
              Уже есть аккаунт?{' '}
              <Link href="/login" className="text-[var(--color-accent)] hover:underline">
                Войти
              </Link>
            </div>

            {/* Глобальная ошибка */}
            {errors.form && (
                <div className="flex items-center justify-between">
                  <p className="text-red-500 text-sm text-center mt-4 flex-1">
                    {errors.form}
                  </p>
                  <button 
                    onClick={() => setErrors({ form: null })}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              )}
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RegisterPage;