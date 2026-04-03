import { useState } from 'react'
import { Copy, Sun, Moon, Languages, Hash } from 'lucide-react'

const translations = {
  en: {
    title: 'Number Base Converter',
    subtitle: 'Convert between binary, octal, decimal and hexadecimal with step-by-step explanation.',
    inputLabel: 'Input value',
    inputBase: 'Input base',
    decimal: 'Decimal (10)',
    binary: 'Binary (2)',
    octal: 'Octal (8)',
    hex: 'Hexadecimal (16)',
    results: 'Conversion Results',
    steps: 'Step-by-step',
    copy: 'Copy',
    copied: 'Copied!',
    invalidInput: 'Invalid input for selected base.',
    stepsTitle: 'How the conversion works',
    builtBy: 'Built by',
  },
  pt: {
    title: 'Conversor de Bases Numericas',
    subtitle: 'Converta entre binario, octal, decimal e hexadecimal com explicacao passo a passo.',
    inputLabel: 'Valor de entrada',
    inputBase: 'Base de entrada',
    decimal: 'Decimal (10)',
    binary: 'Binario (2)',
    octal: 'Octal (8)',
    hex: 'Hexadecimal (16)',
    results: 'Resultados da Conversao',
    steps: 'Passo a passo',
    copy: 'Copiar',
    copied: 'Copiado!',
    invalidInput: 'Entrada invalida para a base selecionada.',
    stepsTitle: 'Como a conversao funciona',
    builtBy: 'Criado por',
  },
} as const

type Lang = keyof typeof translations
type Base = 2 | 8 | 10 | 16

function getSteps(value: string, fromBase: Base, lang: Lang): string[] {
  const decVal = parseInt(value, fromBase)
  if (isNaN(decVal)) return []
  const steps: string[] = []

  if (fromBase !== 10) {
    if (lang === 'en') {
      steps.push(`Step 1: Convert "${value}" (base ${fromBase}) to decimal`)
    } else {
      steps.push(`Passo 1: Converter "${value}" (base ${fromBase}) para decimal`)
    }
    if (fromBase === 2) {
      const bits = value.split('').reverse()
      const parts = bits.map((b, i) => `${b} × 2^${i} = ${parseInt(b) * Math.pow(2, i)}`)
      steps.push(`  ${parts.reverse().join('\n  ')}`)
      steps.push(`  = ${decVal}`)
    } else if (fromBase === 8) {
      const digits = value.split('').reverse()
      const parts = digits.map((d, i) => `${d} × 8^${i} = ${parseInt(d) * Math.pow(8, i)}`)
      steps.push(`  ${parts.reverse().join('\n  ')}`)
      steps.push(`  = ${decVal}`)
    } else if (fromBase === 16) {
      const digits = value.toUpperCase().split('').reverse()
      const hexMap: Record<string, number> = { A: 10, B: 11, C: 12, D: 13, E: 14, F: 15 }
      const parts = digits.map((d, i) => {
        const num = isNaN(Number(d)) ? hexMap[d] : Number(d)
        return `${d} × 16^${i} = ${num * Math.pow(16, i)}`
      })
      steps.push(`  ${parts.reverse().join('\n  ')}`)
      steps.push(`  = ${decVal}`)
    }
  }

  if (lang === 'en') {
    steps.push(`Step ${fromBase !== 10 ? 2 : 1}: Convert ${decVal} (decimal) to each base`)
  } else {
    steps.push(`Passo ${fromBase !== 10 ? 2 : 1}: Converter ${decVal} (decimal) para cada base`)
  }

  const toBinary = (n: number): string => {
    if (n === 0) return '0'
    const result: string[] = []
    let num = n
    while (num > 0) { result.unshift(String(num % 2)); num = Math.floor(num / 2) }
    return result.join('')
  }
  steps.push(`  Binary:  ${decVal} ÷ 2 repeatedly → ${toBinary(decVal)}`)
  steps.push(`  Octal:   ${decVal} ÷ 8 repeatedly → ${decVal.toString(8).toUpperCase()}`)
  steps.push(`  Hex:     ${decVal} ÷ 16 repeatedly → ${decVal.toString(16).toUpperCase()}`)

  return steps
}

interface CopyState { [key: string]: boolean }

export default function NumberBaseConverter() {
  const [lang, setLang] = useState<Lang>(() => navigator.language.startsWith('pt') ? 'pt' : 'en')
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [input, setInput] = useState('255')
  const [fromBase, setFromBase] = useState<Base>(10)
  const [copied, setCopied] = useState<CopyState>({})
  const [showSteps, setShowSteps] = useState(true)

  const t = translations[lang]

  const toggleDark = () => {
    setDark(d => {
      document.documentElement.classList.toggle('dark', !d)
      return !d
    })
  }

  const isValid = (val: string, base: Base): boolean => {
    if (val === '') return true
    const patterns: Record<Base, RegExp> = {
      2: /^[01]+$/,
      8: /^[0-7]+$/,
      10: /^[0-9]+$/,
      16: /^[0-9a-fA-F]+$/,
    }
    return patterns[base].test(val)
  }

  const decVal = input && isValid(input, fromBase) ? parseInt(input, fromBase) : NaN
  const isInvalid = input !== '' && isNaN(decVal)

  const results = isNaN(decVal) || input === '' ? null : {
    binary: decVal.toString(2),
    octal: decVal.toString(8),
    decimal: decVal.toString(10),
    hex: decVal.toString(16).toUpperCase(),
  }

  const steps = results ? getSteps(input, fromBase, lang) : []

  const copyVal = (key: string, val: string) => {
    navigator.clipboard.writeText(val).then(() => {
      setCopied(c => ({ ...c, [key]: true }))
      setTimeout(() => setCopied(c => ({ ...c, [key]: false })), 2000)
    })
  }

  const bases: { label: string; key: Base; color: string }[] = [
    { label: t.binary, key: 2, color: 'text-violet-600 dark:text-violet-400' },
    { label: t.octal, key: 8, color: 'text-violet-600 dark:text-violet-400' },
    { label: t.decimal, key: 10, color: 'text-violet-600 dark:text-violet-400' },
    { label: t.hex, key: 16, color: 'text-violet-600 dark:text-violet-400' },
  ]

  const resultEntries: { label: string; key: string; value: string; base: Base }[] = results
    ? [
        { label: 'Binary (2)', key: 'binary', value: results.binary, base: 2 },
        { label: 'Octal (8)', key: 'octal', value: results.octal, base: 8 },
        { label: 'Decimal (10)', key: 'decimal', value: results.decimal, base: 10 },
        { label: 'Hex (16)', key: 'hex', value: results.hex, base: 16 },
      ]
    : []

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center">
              <Hash size={18} className="text-white" />
            </div>
            <span className="font-semibold">Number Base Converter</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Languages size={14} />
              {lang.toUpperCase()}
            </button>
            <button onClick={toggleDark} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="https://github.com/gmowses/number-base-converter" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.inputBase}</label>
                <div className="grid grid-cols-2 gap-2">
                  {bases.map(({ label, key }) => (
                    <button
                      key={key}
                      onClick={() => { setFromBase(key); setInput('') }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${fromBase === key ? 'bg-violet-500 text-white border-violet-500' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.inputLabel}</label>
                <input
                  type="text"
                  value={input}
                  onChange={e => isValid(e.target.value, fromBase) && setInput(e.target.value.toUpperCase())}
                  placeholder={fromBase === 2 ? '1010' : fromBase === 8 ? '377' : fromBase === 10 ? '255' : 'FF'}
                  className={`w-full rounded-lg border px-4 py-3 font-mono text-xl font-bold focus:outline-none focus:ring-2 bg-zinc-50 dark:bg-zinc-800/50 transition-colors ${isInvalid ? 'border-red-400 focus:ring-red-400' : 'border-zinc-200 dark:border-zinc-700 focus:ring-violet-500'}`}
                />
                {isInvalid && <p className="text-xs text-red-500">{t.invalidInput}</p>}
              </div>
            </div>
          </div>

          {results && (
            <>
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
                <h2 className="font-semibold">{t.results}</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {resultEntries.map(({ label, key, value }) => (
                    <div key={key} className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs uppercase tracking-wide text-zinc-400">{label}</span>
                        <button
                          onClick={() => copyVal(key, value)}
                          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-violet-500 transition-colors"
                        >
                          <Copy size={12} />
                          {copied[key] ? t.copied : t.copy}
                        </button>
                      </div>
                      <p className="font-mono text-lg font-bold text-violet-600 dark:text-violet-400 break-all">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
                <button
                  onClick={() => setShowSteps(s => !s)}
                  className="flex items-center gap-2 font-semibold hover:text-violet-500 transition-colors"
                >
                  <span>{showSteps ? '▾' : '▸'}</span>
                  {t.stepsTitle}
                </button>
                {showSteps && (
                  <pre className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-3 font-mono text-sm overflow-auto whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                    {steps.join('\n')}
                  </pre>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-zinc-400">
          <span>{t.builtBy} <a href="https://github.com/gmowses" className="text-zinc-600 dark:text-zinc-300 hover:text-violet-500 transition-colors">Gabriel Mowses</a></span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  )
}
