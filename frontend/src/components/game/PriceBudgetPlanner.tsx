import { useState, type FormEvent } from 'react'
import { Calculator } from 'lucide-react'
import { ApiError } from '@/api/chatApi'
import { planPriceBudget, type PriceBudgetPlan } from '@/api/priceApi'
import { GlassPanel } from '@/components/ui/glass'
import { useApp } from '@/context/AppContext'

export function PriceBudgetPlanner() {
  const { language } = useApp()
  const en = language === 'en'
  const [budget, setBudget] = useState('')
  const [currency, setCurrency] = useState('RUB')
  const [required, setRequired] = useState('')
  const [optional, setOptional] = useState('')
  const [result, setResult] = useState<PriceBudgetPlan | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const budgetMinor = parsePriceMinor(budget)
    const normalizedCurrency = currency.trim().toUpperCase()
    const requiredKeys = splitSubjectKeys(required)
    const optionalKeys = splitSubjectKeys(optional)
    if (budgetMinor === null || !/^[A-Z]{3}$/.test(normalizedCurrency) || !requiredKeys.length && !optionalKeys.length) {
      setError(en ? 'Enter a budget, currency, and at least one item.' : 'Укажите бюджет, валюту и хотя бы одну позицию.')
      return
    }
    if (requiredKeys.length > 100 || optionalKeys.length > 100) {
      setError(en ? 'Use at most 100 required and 100 optional items.' : 'Можно указать не более 100 обязательных и 100 необязательных позиций.')
      return
    }
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      setResult(await planPriceBudget({
        budget_minor: budgetMinor,
        currency: normalizedCurrency,
        required_subject_keys: requiredKeys,
        optional_subject_keys: optionalKeys,
      }))
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.detail : (en ? 'Could not calculate the budget plan.' : 'Не удалось рассчитать план бюджета.'))
    } finally {
      setBusy(false)
    }
  }

  return <GlassPanel variant="flat" className="p-4 sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="font-sans text-xs uppercase tracking-wide text-text-muted">{en ? 'Budget plan' : 'План бюджета'}</p>
        <p className="mt-1 font-display text-lg font-semibold text-text">{en ? 'Keep the essentials first' : 'Сначала сохраняем главное'}</p>
      </div>
      <Calculator className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
    </div>
    <form onSubmit={submit} className="mt-4 space-y-3">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_76px]">
        <label className="sr-only" htmlFor="price-budget-amount">{en ? 'Budget' : 'Бюджет'}</label>
        <input id="price-budget-amount" value={budget} onChange={(event) => setBudget(event.target.value)} inputMode="decimal" placeholder={en ? 'Budget' : 'Бюджет'} className="h-10 rounded-md border border-hairline bg-panel px-3 font-sans text-sm text-text placeholder:text-text-muted" />
        <label className="sr-only" htmlFor="price-budget-currency">{en ? 'Currency' : 'Валюта'}</label>
        <input id="price-budget-currency" value={currency} onChange={(event) => setCurrency(event.target.value.toUpperCase())} maxLength={3} className="h-10 rounded-md border border-hairline bg-panel px-3 font-sans text-sm uppercase text-text" />
      </div>
      <label className="block font-sans text-xs text-text-secondary" htmlFor="price-budget-required">
        {en ? 'Required items' : 'Обязательные позиции'}
        <textarea id="price-budget-required" value={required} onChange={(event) => setRequired(event.target.value)} rows={2} maxLength={20_000} placeholder={en ? 'One item per line or separated by commas' : 'По одной в строке или через запятую'} className="mt-1 block w-full rounded-md border border-hairline bg-panel p-2 text-sm text-text placeholder:text-text-muted" />
      </label>
      <label className="block font-sans text-xs text-text-secondary" htmlFor="price-budget-optional">
        {en ? 'Optional items' : 'Необязательные позиции'}
        <textarea id="price-budget-optional" value={optional} onChange={(event) => setOptional(event.target.value)} rows={2} maxLength={20_000} placeholder={en ? 'The planner keeps these only when they fit' : 'План добавит их, только если хватает бюджета'} className="mt-1 block w-full rounded-md border border-hairline bg-panel p-2 text-sm text-text placeholder:text-text-muted" />
      </label>
      <button type="submit" disabled={busy} className="h-10 rounded-md bg-primary px-3 font-sans text-sm font-semibold text-white disabled:opacity-60">
        {busy ? (en ? 'Calculating…' : 'Считаем…') : (en ? 'Build plan' : 'Построить план')}
      </button>
    </form>
    {error && <p role="alert" className="mt-3 font-sans text-sm text-error">{error}</p>}
    {result && <BudgetPlanResult result={result} language={language} />}
  </GlassPanel>
}

function BudgetPlanResult({ result, language }: { result: PriceBudgetPlan; language: 'ru' | 'en' }) {
  const en = language === 'en'
  const total = result.total_minor === undefined ? null : formatMoney(result.total_minor, result.currency, language)
  const remaining = result.remaining_minor === undefined ? null : formatMoney(result.remaining_minor, result.currency, language)
  if (result.status === 'unknown') return <div role="status" className="mt-3 rounded-md bg-panel-2 p-3 font-sans text-sm text-text-secondary">
    <p>{en ? 'A fresh price is required before this plan can be calculated.' : 'Для расчёта плана нужна свежая цена.'}</p>
    {result.missing?.length ? <p className="mt-1">{en ? 'No fresh price:' : 'Нет свежей цены:'} {result.missing.join(', ')}</p> : null}
    {result.currency_mismatch?.length ? <p className="mt-1">{en ? 'Different currency:' : 'Другая валюта:'} {result.currency_mismatch.join(', ')}</p> : null}
  </div>
  if (result.status === 'infeasible') return <div role="status" className="mt-3 rounded-md bg-destructive/10 p-3 font-sans text-sm text-text-secondary">
    <p className="font-medium text-text">{en ? 'The required items exceed the budget.' : 'Обязательные позиции превышают бюджет.'}</p>
    {total && <p className="mt-1">{en ? 'Required total:' : 'Обязательная сумма:'} {total}</p>}
  </div>
  return <div role="status" className="mt-3 rounded-md bg-primary/10 p-3 font-sans text-sm text-text-secondary">
    <p className="font-medium text-text">{result.status === 'compromise'
      ? (en ? 'The plan keeps the required items and removes extras.' : 'План сохраняет обязательное и убирает лишнее.')
      : (en ? 'Everything fits in the budget.' : 'Все позиции укладываются в бюджет.')}
    </p>
    {total && remaining && <p className="mt-1">{en ? 'Plan:' : 'План:'} {total} · {en ? 'left:' : 'осталось:'} {remaining}</p>}
    {result.included?.length ? <p className="mt-1">{en ? 'Included:' : 'Включено:'} {result.included.join(', ')}</p> : null}
    {result.excluded?.length ? <p className="mt-1">{en ? 'Excluded:' : 'Исключено:'} {result.excluded.join(', ')}</p> : null}
  </div>
}

function splitSubjectKeys(value: string) {
  return [...new Set(value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean))]
}

function parsePriceMinor(value: string): number | null {
  const match = value.trim().match(/^(0|[1-9]\d*)(?:[.,](\d{0,2}))?$/)
  if (!match) return null
  const whole = Number(match[1])
  const fractional = Number(`${match[2] ?? ''}00`.slice(0, 2))
  const amountMinor = whole * 100 + fractional
  return Number.isSafeInteger(amountMinor) ? amountMinor : null
}

function formatMoney(amountMinor: number, currency: string, language: 'ru' | 'en') {
  return new Intl.NumberFormat(language === 'en' ? 'en-US' : 'ru-RU', { style: 'currency', currency }).format(amountMinor / 100)
}
