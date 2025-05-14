'use client';

import React, { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import ReCAPTCHA from 'react-google-recaptcha';
import clsx from 'clsx';
import toast, { Toaster } from 'react-hot-toast';
import { FaTelegramPlane, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

// Типы данных формы
type FormData = {
  name: string;
  question: string;
  phone: string;
  agreement: boolean;
};

// Конфигурация
const CONFIG = {
  recaptchaKey: '6LcfqTcrAAAAAI-ei4DszP03YmH-OezKPilCj-Iw',
  contacts: {
    telegram: 'https://t.me/daimon_off ',
    phone: '+79519337369',
    email: 'ares-gd@yandex.ru'
  }
};

// Кастомные компоненты
const Input = ({ label, error, ...props }: any) => (
  <div className="space-y-1">
    <input
      {...props}
      className={clsx(
        "w-full px-4 py-3 bg-transparent rounded-lg border focus:ring-2 transition-colors",
        "border-gray-600 focus:border-accent focus:ring-accent/30",
        error && "border-red-500 focus:border-red-500 focus:ring-red-500/30"
      )}
    />
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
);

const ContactCard = ({ icon: Icon, title, href, isPhone = false }: any) => (
  <a
    href={isPhone ? `tel:${href}` : href}
    target={isPhone ? undefined : "_blank"}
    rel={isPhone ? undefined : "noopener noreferrer"}
    className="bg-dark p-2 md:p-6 rounded-2xl text-center space-y-4 hover:bg-gray-800/50 transition-colors flex-1  flex flex-col items-center justify-center"
  >
    <Icon className="text-accent text-4xl mx-auto" />
  </a>
);

export default function ContactPage() {
  // Состояния
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      question: '',
      phone: '',
      agreement: false
    }
  });

  const recaptchaRef = useRef<ReCAPTCHA>(null);

  // Валидация телефона
  const validatePhone = (value: string) => {
    const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
    return phoneRegex.test(value) || 'Некорректный номер телефона';
  };

  // Обработка отправки формы
  const onSubmit = async (data: FormData) => {
    if (!recaptchaToken) {
      toast.error('Подтвердите, что вы не робот');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          phone: data.phone.replace(/\D/g, ''),
          recaptchaToken
        })
      });

      if (!response.ok) throw new Error('Ошибка отправки формы');

      toast.success('Ваш вопрос успешно отправлен!');
      reset();
      recaptchaRef.current?.reset();
    } catch (error) {
      console.error('Ошибка:', error);
      toast.error('Произошла ошибка при отправке формы. Пожалуйста, попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 bg-background" id="contact">
      <Toaster position="top-right" />
      
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-accent mb-16" >
          Есть вопрос? Задайте его нашей команде
        </h2>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Форма */}
          <div className="flex-1">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-dark rounded-2xl p-6 shadow-lg">
              <div className="space-y-6">
                {/* Имя */}
                <Input
                  label="Имя"
                  placeholder="Ваше имя"
                  {...register('name', { 
                    required: 'Имя обязательно',
                    minLength: { value: 2, message: 'Минимум 2 символа' }
                  })}
                  error={errors.name?.message}
                />

                {/* Вопрос */}
                <Input
                  label="Вопрос"
                  placeholder="Ваш вопрос"
                  {...register('question', { 
                    required: 'Введите ваш вопрос',
                    minLength: { value: 10, message: 'Вопрос должен содержать минимум 10 символов' }
                  })}
                  error={errors.question?.message}
                />

                {/* Телефон */}
                <Controller
                  name="phone"
                  control={control}
                  rules={{
                    required: 'Телефон обязателен',
                    validate: validatePhone
                  }}
                  render={({ field }) => (
                    <IMaskInput
                      {...field}
                      mask="+7 (000) 000-00-00"
                      placeholder="Ваш телефон"
                      className={clsx(
                        "w-full px-4 py-3 bg-transparent rounded-lg border focus:ring-2 transition-colors",
                        "border-gray-600 focus:border-accent focus:ring-accent/30",
                        errors.phone && "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                      )}
                    />
                  )}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}

                {/* Согласие */}
                <div className="space-y-4 mt-2">
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      {...register('agreement', {
                        required: 'Необходимо согласие на обработку данных'
                      })}
                      className="mt-1 rounded text-accent focus:ring-accent"
                    />
                    <label htmlFor="agreement" className="text-sm text-gray-300">
                      Даю согласие на обработку
                      <a href="/privacy" className="text-accent underline ml-1">
                        Политики конфиденциальности
                      </a>
                    </label>
                  </div>
                  {errors.agreement && <p className="text-red-500 text-sm">{errors.agreement.message}</p>}

                  {/* reCAPTCHA */}
                  <div className="flex justify-center my-4">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={CONFIG.recaptchaKey}
                      hl="ru"
                      onChange={token => setRecaptchaToken(token)}
                      className="mx-auto"
                    />
                  </div>

                  {/* Кнопка отправки */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !isDirty}
                    className={clsx(
                      "w-full bg-accent text-white py-3 rounded-lg hover:bg-opacity-90 transition-colors",
                      "focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-70",
                      "disabled:cursor-not-allowed"
                    )}
                  >
                    {isSubmitting ? 'Отправка...' : 'Задать вопрос'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Контакты */}
          <div className="flex-1">
            <div className="flex flex-col items-center ">
              <h3 className="text-2xl font-bold text-center text-accent mb-6">Наши контакты</h3>
              
              <div className="flex md:grid flex-wrap md:grid-cols-1 gap-6 w-full">
                <ContactCard 
                  icon={FaTelegramPlane} 
                  title="Telegram" 
                  href={CONFIG.contacts.telegram} 
                />

                <ContactCard 
                  icon={FaPhoneAlt} 
                  title="Позвонить" 
                  href={CONFIG.contacts.phone} 
                  isPhone 
                />
                <ContactCard 
                  icon={FaEnvelope} 
                  title="Email" 
                  href={`mailto:${CONFIG.contacts.email}`} 
                />
              </div>
              
              <div className="mt-8 text-center text-gray-400 text-sm">
                <p>Работаем ежедневно с 9:00 до 21:00</p>
                <p className="mt-1">Быстрая обратная связь 7 дней в неделю</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}