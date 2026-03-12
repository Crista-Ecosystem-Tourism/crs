import React from 'react'
import { motion } from 'framer-motion'
import LiquidBackground from '@/components/canvas/LiquidBackground'
import { ReviewCard } from './ReviewCard'
import { Logo } from '@/components/icons/Logo'

interface AuthLayoutProps {
    children: React.ReactNode
    title: string
    subtitle?: string
}

const REVIEWS = [
    {
        text: "Этот AI-планировщик полностью изменил подход к моим путешествиям. Максимально интуитивно и красиво!",
        author: "Александр Волков",
        role: "Трэвел-блогер",
        avatarUrl: "/avatars/alexander.png"
    },
    {
        text: "Наконец-то нашла инструмент, который понимает мои предпочтения с полуслова.",
        author: "Мария Соколова",
        role: "Цифровой кочевник",
        avatarUrl: "/avatars/maria.png"
    },
    {
        text: "Дизайн просто космический. Пользуюсь каждый день для поиска вдохновения.",
        author: "Дмитрий Петров",
        role: "UI/UX Дизайнер",
        avatarUrl: "/avatars/dmitry.png"
    }
]

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-screen w-full overflow-hidden bg-background">
            {/* Split Container */}
            <div className="flex w-full flex-col md:flex-row">

                {/* Left Side: Form Area (Clean White) */}
                <div className="relative z-20 flex w-full flex-col items-center justify-center bg-surface px-6 py-12 md:w-1/2 lg:w-[48%] xl:w-[45%] md:m-8 md:rounded-[24px] md:shadow-[0_4px_40px_rgba(0,0,0,0.08)] md:border md:border-border">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-[420px]"
                    >
                        {/* Logo at the top */}
                        <div className="mb-20 flex items-center gap-2.5 justify-center md:justify-start">
                            <Logo size={36} />
                            <div className="flex flex-col text-left">
                                <span className="text-lg font-bold leading-tight text-text">Crista</span>
                                <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted">Online</span>
                            </div>
                        </div>

                        {/* Title and Subtitle */}
                        <div className="mb-10 text-center md:text-left">
                            <h1 className="text-[2.5rem] font-bold leading-tight tracking-tight text-text">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="mt-2 text-lg text-text-secondary">
                                    {subtitle}
                                </p>
                            )}
                        </div>

                        {/* Form Content */}
                        <div className="w-full">
                            {children}
                        </div>

                        {/* Bottom Terms (as in ref image) */}
                        <div className="mt-12 text-center text-[0.8rem] text-text-muted md:text-left">
                            Продолжая, вы подтверждаете, что принимаете наши{' '}
                            <a href="#" className="underline hover:text-text transition-colors">Условия использования</a> и{' '}
                            <a href="#" className="underline hover:text-text transition-colors">Политику конфиденциальности</a>.
                        </div>
                    </motion.div>
                </div>

                {/* Right Side: Themed Showcase */}
                <div className="relative hidden flex-1 items-center justify-center p-8 md:flex overflow-visible">
                    {/* Shader layer restricted to right side */}
                    <div className="absolute inset-0 z-0">
                        <LiquidBackground />
                    </div>

                    {/* Visual Decorative Glows - behind cards */}
                    <div className="absolute -top-40 -right-20 h-96 w-96 rounded-full bg-[#5BC4F7]/10 blur-[120px] pointer-events-none" />
                    <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-[#1A8A9C]/10 blur-[120px] pointer-events-none" />

                    {/* Content on the right */}
                    <div className="relative z-10 flex w-full max-w-lg flex-col gap-6">
                        {REVIEWS.map((review, i) => (
                            <div
                                key={i}
                                className={i === 1 ? 'ml-12' : i === 0 ? 'ml-6' : ''}
                            >
                                <ReviewCard
                                    {...review}
                                    delay={0.6 + i * 0.2}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
