import { motion } from 'framer-motion'

interface ReviewCardProps {
    text: string
    author: string
    role: string
    avatarUrl: string
    delay?: number
}

export function ReviewCard({ text, author, role, avatarUrl, delay = 0 }: ReviewCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay, ease: "easeOut" }}
            whileHover={{ y: -4, scale: 1.01 }}
            className="group w-full max-w-sm overflow-hidden rounded-[24px] border border-white/40 bg-white/40 p-10 shadow-[0_8px_32px_rgba(0,0,0,0.05)] backdrop-blur-md transition-all duration-500 hover:bg-white/60 hover:shadow-[0_12px_48px_rgba(0,0,0,0.08)]"
        >
            <div className="mb-8">
                <p className="text-[1.05rem] font-medium leading-relaxed text-[#1a1a1a] opacity-90">
                    "{text}"
                </p>
            </div>
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#E0E7FF] to-[#F3F4F6] shadow-sm border border-white flex items-center justify-center overflow-hidden">
                    <img
                        src={avatarUrl}
                        alt={author}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                </div>
                <div>
                    <h4 className="text-[0.95rem] font-bold text-[#1a1a1a]">{author}</h4>
                    <p className="text-[0.75rem] font-medium text-[#666666] uppercase tracking-widest">{role}</p>
                </div>
            </div>
        </motion.div>
    )
}
