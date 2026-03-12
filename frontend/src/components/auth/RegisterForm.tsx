import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { AuthLayout } from './AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function RegisterForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { registerWithEmail } = useApp()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!name.trim()) {
            setError('Введите имя')
            return
        }
        if (!email.trim()) {
            setError('Введите email')
            return
        }
        if (password.length < 6) {
            setError('Пароль должен быть не менее 6 символов')
            return
        }

        setLoading(true)
        try {
            await registerWithEmail(email.trim(), password, name.trim())
            navigate('/')
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Ошибка регистрации'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout
            title="Создайте"
            subtitle="бесплатный аккаунт"
        >
            <div className="mt-8 grid gap-6">
                <form onSubmit={handleSubmit} className="grid gap-4">
                    {error && (
                        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <Input
                        id="name"
                        placeholder="Ваше имя"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                        className="h-[3.5rem] w-full rounded-[12px] border-border bg-surface-light px-4 text-[1rem] text-text placeholder:text-text-muted focus:border-primary focus:ring-0 transition-colors"
                    />
                    <Input
                        id="email"
                        placeholder="Эл. почта"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="h-[3.5rem] w-full rounded-[12px] border-border bg-surface-light px-4 text-[1rem] text-text placeholder:text-text-muted focus:border-primary focus:ring-0 transition-colors"
                    />
                    <Input
                        id="password"
                        placeholder="Пароль (мин. 6 символов)"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        className="h-[3.5rem] w-full rounded-[12px] border-border bg-surface-light px-4 text-[1rem] text-text placeholder:text-text-muted focus:border-primary focus:ring-0 transition-colors"
                    />
                    <Button
                        type="submit"
                        disabled={loading}
                        className="mt-2 h-[3.5rem] w-full rounded-[12px] bg-[#10a37f] text-[1rem] font-bold text-white transition-all hover:bg-[#0d8a6a] disabled:opacity-50"
                    >
                        {loading ? 'Создаём...' : 'Создать аккаунт'}
                    </Button>
                </form>

                {/* Product info banner */}
                <div className="rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 text-[0.82rem] leading-relaxed text-text-secondary">
                    <p className="font-semibold text-text mb-1">🚀 Тестовый режим</p>
                    <p>
                        Сейчас доступны <span className="font-semibold text-text">Сочи</span> и <span className="font-semibold text-text">Санкт-Петербург</span>.
                        Модуль статей и путеводителей — в разработке.
                    </p>
                    <p className="mt-1.5 text-text-muted">
                        Ваши маршруты обучают нейросеть — чем больше вы путешествуете с нами, тем умнее становятся рекомендации.
                    </p>
                </div>

                <div className="text-center text-[0.9rem] md:text-left">
                    <span className="text-[#888888]">Уже есть аккаунт? </span>
                    <Link
                        to="/login"
                        className="font-bold text-[#10a37f] hover:underline underline-offset-4"
                    >
                        Войти
                    </Link>
                </div>
            </div>
        </AuthLayout>
    )
}
