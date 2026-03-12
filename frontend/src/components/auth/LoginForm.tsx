import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { AuthLayout } from './AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { loginWithEmail } = useApp()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!email.trim() || !password) {
            setError('Введите email и пароль')
            return
        }

        setLoading(true)
        try {
            await loginWithEmail(email.trim(), password)
            navigate('/')
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Ошибка входа'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout
            title="Войдите в аккаунт"
            subtitle="Каждое ваше путешествие обучает нашу нейросеть. Рекомендации становятся точнее с каждой поездкой."
        >
            <div className="mt-8 grid gap-8">
                <form onSubmit={handleSubmit} className="grid gap-5">
                    {error && (
                        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaaaaa]">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                        </div>
                        <Input
                            id="email"
                            placeholder="Эл. почта"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            className="h-[3.5rem] w-full rounded-[12px] border-border bg-surface-light pl-12 pr-4 text-[1rem] text-text placeholder:text-text-muted focus:border-primary focus:ring-0 transition-colors"
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaaaaa]">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <Input
                            id="password"
                            placeholder="Пароль"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            className="h-[3.5rem] w-full rounded-[12px] border-border bg-surface-light pl-12 pr-4 text-[1rem] text-text placeholder:text-text-muted focus:border-primary focus:ring-0 transition-colors"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="h-[3.5rem] w-full rounded-[12px] bg-[#10a37f] text-[1rem] font-bold text-white transition-all hover:bg-[#0d8a6a] disabled:opacity-50"
                    >
                        {loading ? 'Входим...' : 'Войти'}
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
                    <span className="text-[#888888]">Нет аккаунта? </span>
                    <Link
                        to="/signup"
                        className="font-bold text-[#10a37f] hover:underline underline-offset-4"
                    >
                        Зарегистрируйтесь бесплатно
                    </Link>
                </div>
            </div>
        </AuthLayout>
    )
}
