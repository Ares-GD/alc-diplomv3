'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import Header from "@/components/common/Header"
import Footer from "@/components/common/Footer"
import { CartProvider } from "@/components/CartProvider"

interface IndividualData {
  inn?: string | null
  companyName?: string | null
  ogrnip?: string | null
}
interface LegalEntityData {
  inn?: string | null
  companyName?: string | null
  kpp?: string | null
  ogrn?: string | null
}
interface ClientData {
  id: number
  phone?: string | null
  legalAddress?: string | null
  type: "individual" | "legal_entity"
  individual?: IndividualData
  legalEntity?: LegalEntityData
}
interface UserData {
  id: string
  email: string
  role?: string
  client?: ClientData
}

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const [saving, setSaving] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({})
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [role, setRole] = useState<string>("")

  // Состояния формы
  const [email, setEmail] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [legalAddress, setLegalAddress] = useState("")
  const [clientType, setClientType] = useState<"individual" | "legal_entity">("individual")
  const [indInn, setIndInn] = useState("")
  const [indCompany, setIndCompany] = useState("")
  const [indOgrnip, setIndOgrnip] = useState("")
  const [leInn, setLeInn] = useState("")
  const [leCompany, setLeCompany] = useState("")
  const [leKpp, setLeKpp] = useState("")
  const [leOgrn, setLeOgrn] = useState("")

  // Пароли
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Форматирование телефона
  const formatPhoneForFrontend = (phone: string): string => {
    return phone.replace(/\D/g, '')
  }

  // Загрузка данных из сессии
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const userData = session.user as UserData
      setEmail(userData.email || "")
      setRole(userData.role || "")

      if (userData.role === "user" && userData.client) {
        setClientPhone(formatPhoneForFrontend(userData.client.phone || ""))
        setLegalAddress(userData.client.legalAddress || "")
        setClientType(userData.client.type)

        if (userData.client.type === "individual" && userData.client.individual) {
          setIndInn(userData.client.individual.inn || "")
          setIndCompany(userData.client.individual.companyName || "")
          setIndOgrnip(userData.client.individual.ogrnip || "")
        }

        if (userData.client.type === "legal_entity" && userData.client.legalEntity) {
          setLeInn(userData.client.legalEntity.inn || "")
          setLeCompany(userData.client.legalEntity.companyName || "")
          setLeKpp(userData.client.legalEntity.kpp || "")
          setLeOgrn(userData.client.legalEntity.ogrn || "")
        }
      }
    }
  }, [status, session])

  // Валидация полей профиля
  const validateProfileFields = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!email.trim()) newErrors.email = "Email обязателен"
    else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = "Неверный формат email"

    if (role === "user") {
      if (!clientPhone.trim()) {
        newErrors.clientPhone = "Телефон организации обязателен"
      } else if (clientPhone.length < 10) {
        newErrors.clientPhone = "Телефон должен содержать не менее 10 цифр"
      }

      if (!legalAddress.trim()) {
        newErrors.legalAddress = "Юридический адрес обязателен"
      } else if (legalAddress.length < 5) {
        newErrors.legalAddress = "Адрес должен содержать не менее 5 символов"
      }

      if (clientType === "individual") {
        if (!indInn) newErrors.indInn = "ИНН обязателен"
        else if (!/^\d+$/.test(indInn)) newErrors.indInn = "ИНН должен содержать только цифры"
        else if (indInn.length !== 12) newErrors.indInn = "ИНН должен содержать 12 цифр"

        if (!indCompany.trim()) newErrors.indCompany = "Название компании обязательно"

        if (!indOgrnip) newErrors.indOgrnip = "ОГРНИП обязателен"
        else if (!/^\d+$/.test(indOgrnip)) newErrors.indOgrnip = "ОГРНИП должен содержать только цифры"
        else if (indOgrnip.length !== 15) newErrors.indOgrnip = "ОГРНИП должен содержать 15 цифр"
      } else if (clientType === "legal_entity") {
        if (!leInn) newErrors.leInn = "ИНН обязателен"
        else if (!/^\d+$/.test(leInn)) newErrors.leInn = "ИНН должен содержать только цифры"
        else if (leInn.length !== 10) newErrors.leInn = "ИНН должен содержать 10 цифр"

        if (!leCompany.trim()) newErrors.leCompany = "Название компании обязательно"

        if (!leKpp) newErrors.leKpp = "КПП обязателен"
        else if (!/^\d+$/.test(leKpp)) newErrors.leKpp = "КПП должен содержать только цифры"
        else if (leKpp.length !== 9) newErrors.leKpp = "КПП должен содержать 9 цифр"

        if (!leOgrn) newErrors.leOgrn = "ОГРН обязателен"
        else if (!/^\d+$/.test(leOgrn)) newErrors.leOgrn = "ОГРН должен содержать только цифры"
        else if (leOgrn.length !== 13) newErrors.leOgrn = "ОГРН должен содержать 13 цифр"
      }
    }

    setProfileErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Валидация пароля
  const validatePasswordFields = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!oldPassword) newErrors.oldPassword = "Старый пароль обязателен"
    if (!newPassword) newErrors.newPassword = "Новый пароль обязателен"
    if (newPassword && newPassword.length < 8) {
      newErrors.newPassword = "Пароль должен быть не менее 8 символов"
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают"
    }
    setPasswordErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Сохранение профиля
  const handleSaveProfile = async () => {
    if (!validateProfileFields()) return
    setSaving(true)

    try {
      const bodyData: any = { email }

      if (role === "user") {
        bodyData.client = {
          phone: clientPhone,
          legalAddress,
          type: clientType,
          ...(clientType === "individual" && {
            individual: {
              inn: indInn || "",
              companyName: indCompany || "",
              ogrnip: indOgrnip || ""
            }
          }),
          ...(clientType === "legal_entity" && {
            legalEntity: {
              inn: leInn || "",
              companyName: leCompany || "",
              kpp: leKpp || "",
              ogrn: leOgrn || ""
            }
          })
        }
      }

      const response = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.errors) setProfileErrors(errorData.errors)
        throw new Error("Ошибка сохранения данных")
      }

      await update()
      alert("Данные профиля успешно обновлены")
    } catch (error: any) {
      console.error("Ошибка сохранения:", error)
      alert(`Ошибка: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Изменение пароля
  const handleChangePassword = async () => {
    if (!validatePasswordFields()) return
    setPasswordLoading(true)

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword })
      })

      if (!response.ok) throw new Error("Ошибка изменения пароля")

      alert("Пароль успешно изменён")
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setPasswordErrors({})
    } catch (error: any) {
      alert(`Ошибка: ${error.message}`)
    } finally {
      setPasswordLoading(false)
    }
  }

  if (status === "loading") {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-dark)] text-white">
          <p>Загрузка профиля...</p>
        </div>
    )
  }

  return (
      <div className="min-h-screen flex flex-col bg-[var(--color-dark)] text-white">
        <CartProvider>
          <Header />
        </CartProvider>

        <main className="flex-grow p-4 md:p-8 w-full">
          <div className="bg-[var(--color-dark)] p-6 rounded-lg shadow-lg max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-[var(--color-accent)] border-b border-[var(--color-gray)] pb-4">
              Профиль пользователя
            </h2>

            {/* Основная информация */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full bg-[var(--color-gray)] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all ${
                        profileErrors.email ? "border border-[var(--color-error)]" : ""
                    }`}
                />
                {profileErrors.email && <p className="text-[var(--color-error)] text-sm mt-1">{profileErrors.email}</p>}
              </div>
            </div>

            {/* Пользовательские данные (только для роли user) */}
            {role === "user" && (
                <>
                  {/* Тип клиента */}
                  <div className="mb-8">
                    <label className="block mb-3 text-sm font-medium text-gray-300">Тип клиента</label>
                    <div className="flex gap-4">
                      <button
                          type="button"
                          onClick={() => setClientType("individual")}
                          className={`px-6 py-3 rounded-lg transition-all duration-200 font-medium ${
                              clientType === "individual"
                                  ? "bg-[var(--color-accent)] text-[var(--color-dark)] shadow-md"
                                  : "bg-[var(--color-gray)] hover:bg-gray-600 text-white"
                          }`}
                      >
                        Физическое лицо
                      </button>
                      <button
                          type="button"
                          onClick={() => setClientType("legal_entity")}
                          className={`px-6 py-3 rounded-lg transition-all duration-200 font-medium ${
                              clientType === "legal_entity"
                                  ? "bg-[var(--color-accent)] text-[var(--color-dark)] shadow-md"
                                  : "bg-[var(--color-gray)] hover:bg-gray-600 text-white"
                          }`}
                      >
                        Юрлицо
                      </button>
                    </div>
                  </div>

                  {/* Общие данные клиента */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-300">Телефон организации</label>
                      <input
                          type="tel"
                          value={clientPhone}
                          maxLength={12}
                          onChange={(e) => setClientPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="10-12 цифр"
                          className={`w-full bg-[var(--color-gray)] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all ${
                              profileErrors.clientPhone ? "border border-[var(--color-error)]" : ""
                          }`}
                      />
                      {profileErrors.clientPhone && <p className="text-[var(--color-error)] text-sm mt-1">{profileErrors.clientPhone}</p>}
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-300">Юридический адрес</label>
                      <input
                          type="text"
                          value={legalAddress}
                          onChange={(e) => setLegalAddress(e.target.value)}
                          className={`w-full bg-[var(--color-gray)] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all ${
                              profileErrors.legalAddress ? "border border-[var(--color-error)]" : ""
                          }`}
                      />
                      {profileErrors.legalAddress && <p className="text-[var(--color-error)] text-sm mt-1">{profileErrors.legalAddress}</p>}
                    </div>
                  </div>

                  {/* Условные поля по типу клиента */}
                  {clientType === "individual" ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-300">ИНН</label>
                            <input
                                type="text"
                                value={indInn}
                                onChange={(e) => setIndInn(e.target.value.replace(/\D/g, '').slice(0, 12))}
                                maxLength={12}
                                placeholder="12 цифр"
                                className={`w-full bg-[var(--color-gray)] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all ${
                                    profileErrors.indInn ? "border border-[var(--color-error)]" : ""
                                }`}
                            />
                            {profileErrors.indInn && <p className="text-[var(--color-error)] text-sm mt-1">{profileErrors.indInn}</p>}
                          </div>

                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-300">Компания</label>
                            <input
                                type="text"
                                value={indCompany}
                                onChange={(e) => setIndCompany(e.target.value.slice(0, 100))}
                                maxLength={100}
                                className={`w-full bg-[var(--color-gray)] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all ${
                                    profileErrors.indCompany ? "border border-[var(--color-error)]" : ""
                                }`}
                            />
                            {profileErrors.indCompany && <p className="text-[var(--color-error)] text-sm mt-1">{profileErrors.indCompany}</p>}
                          </div>
                        </div>

                        <div className="mb-8">
                          <label className="block mb-2 text-sm font-medium text-gray-300">ОГРНИП</label>
                          <input
                              type="text"
                              value={indOgrnip}
                              onChange={(e) => setIndOgrnip(e.target.value.replace(/\D/g, '').slice(0, 15))}
                              maxLength={15}
                              placeholder="15 цифр"
                              className={`w-full bg-[var(--color-gray)] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all ${
                                  profileErrors.indOgrnip ? "border border-[var(--color-error)]" : ""
                              }`}
                          />
                          {profileErrors.indOgrnip && <p className="text-[var(--color-error)] text-sm mt-1">{profileErrors.indOgrnip}</p>}
                        </div>
                      </>
                  ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-300">ИНН</label>
                            <input
                                type="text"
                                value={leInn}
                                onChange={(e) => setLeInn(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                maxLength={10}
                                placeholder="10 цифр"
                                className={`w-full bg-[var(--color-gray)] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all ${
                                    profileErrors.leInn ? "border border-[var(--color-error)]" : ""
                                }`}
                            />
                            {profileErrors.leInn && <p className="text-[var(--color-error)] text-sm mt-1">{profileErrors.leInn}</p>}
                          </div>

                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-300">Компания</label>
                            <input
                                type="text"
                                value={leCompany}
                                onChange={(e) => setLeCompany(e.target.value.slice(0, 100))}
                                maxLength={100}
                                className={`w-full bg-[var(--color-gray)] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all ${
                                    profileErrors.leCompany ? "border border-[var(--color-error)]" : ""
                                }`}
                            />
                            {profileErrors.leCompany && <p className="text-[var(--color-error)] text-sm mt-1">{profileErrors.leCompany}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-300">КПП</label>
                            <input
                                type="text"
                                value={leKpp}
                                onChange={(e) => setLeKpp(e.target.value.replace(/\D/g, '').slice(0, 9))}
                                maxLength={9}
                                placeholder="9 цифр"
                                className={`w-full bg-[var(--color-gray)] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all ${
                                    profileErrors.leKpp ? "border border-[var(--color-error)]" : ""
                                }`}
                            />
                            {profileErrors.leKpp && <p className="text-[var(--color-error)] text-sm mt-1">{profileErrors.leKpp}</p>}
                          </div>

                          <div>
                            <label className="block mb-2 text-sm font-medium text-gray-300">ОГРН</label>
                            <input
                                type="text"
                                value={leOgrn}
                                onChange={(e) => setLeOgrn(e.target.value.replace(/\D/g, '').slice(0, 13))}
                                maxLength={13}
                                placeholder="13 цифр"
                                className={`w-full bg-[var(--color-gray)] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all ${
                                    profileErrors.leOgrn ? "border border-[var(--color-error)]" : ""
                                }`}
                            />
                            {profileErrors.leOgrn && <p className="text-[var(--color-error)] text-sm mt-1">{profileErrors.leOgrn}</p>}
                          </div>
                        </div>
                      </>
                  )}
                </>
            )}

            {/* Изменение пароля */}
            <div className="border-t border-[var(--color-gray)] pt-8 mt-8">
              <h3 className="font-bold mb-6 text-lg text-[var(--color-accent)]">Изменить пароль</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">Старый пароль</label>
                  <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value.slice(0, 32))}
                      maxLength={32}
                      className={`w-full bg-[var(--color-gray)] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all ${
                          passwordErrors.oldPassword ? "border border-[var(--color-error)]" : ""
                      }`}
                  />
                  {passwordErrors.oldPassword && <p className="text-[var(--color-error)] text-sm mt-1">{passwordErrors.oldPassword}</p>}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">Новый пароль</label>
                  <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value.slice(0, 32))}
                      maxLength={32}
                      className={`w-full bg-[var(--color-gray)] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all ${
                          passwordErrors.newPassword ? "border border-[var(--color-error)]" : ""
                      }`}
                  />
                  {passwordErrors.newPassword && <p className="text-[var(--color-error)] text-sm mt-1">{passwordErrors.newPassword}</p>}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">Подтвердите пароль</label>
                  <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value.slice(0, 32))}
                      maxLength={32}
                      className={`w-full bg-[var(--color-gray)] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all ${
                          passwordErrors.confirmPassword ? "border border-[var(--color-error)]" : ""
                      }`}
                  />
                  {passwordErrors.confirmPassword && <p className="text-[var(--color-error)] text-sm mt-1">{passwordErrors.confirmPassword}</p>}
                </div>
              </div>

              <button
                  onClick={handleChangePassword}
                  disabled={passwordLoading}
                  className="bg-[var(--color-accent)] hover:bg-opacity-90 text-[var(--color-dark)] px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {passwordLoading ? "Сохранение..." : "Сохранить пароль"}
              </button>
            </div>

            {/* Кнопки управления */}
            <div className="mt-12 flex flex-wrap gap-4">
              <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="bg-[var(--color-accent)] hover:bg-opacity-90 text-[var(--color-dark)] px-8 py-3 rounded-lg font-medium flex-1 min-w-[160px] transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Сохранение..." : "Сохранить изменения"}
              </button>

              <button
                  onClick={() => signOut()}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Выйти
              </button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
  )
}