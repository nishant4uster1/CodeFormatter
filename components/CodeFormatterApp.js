'use client'

import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { TOOLS, CATEGORIES } from '@/lib/tools'
import DiffChecker from '@/components/DiffChecker'
import JsonTree from '@/components/JsonTree'
import AdSlot from '@/components/AdSlot'
import CookieConsent from '@/components/CookieConsent'
import SeoContent from '@/components/SeoContent'
import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml'
import yamlLang from 'highlight.js/lib/languages/yaml'
import javascript from 'highlight.js/lib/languages/javascript'
import css from 'highlight.js/lib/languages/css'
import sqlLang from 'highlight.js/lib/languages/sql'
import plaintext from 'highlight.js/lib/languages/plaintext'
import {
  Search,
  Copy,
  Check,
  Eraser,
  Play,
  Sparkles,
  Braces,
  Code2,
  FileCode2,
  ArrowLeftRight,
  LockKeyhole,
  Type,
  Wand2,
  ExternalLink,
  Zap,
  Shield,
  Rocket,
  Upload,
  Download,
  Sun,
  Moon,
  Share2,
  History,
  Trash2,
  Star,
} from 'lucide-react'

hljs.registerLanguage('json', json)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('yaml', yamlLang)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('css', css)
hljs.registerLanguage('sql', sqlLang)
hljs.registerLanguage('plaintext', plaintext)

const CATEGORY_ICONS = {
  Favorites: Star,
  Formatters: Braces,
  Minifiers: FileCode2,
  Converters: ArrowLeftRight,
  'Encoders / Decoders': LockKeyhole,
  'Text Tools': Type,
  Generators: Wand2,
  'Viewers & Utilities': Sparkles,
}

const CATEGORY_COLORS = {
  Favorites: 'from-amber-400 to-yellow-500',
  Formatters: 'from-blue-500 to-cyan-500',
  Minifiers: 'from-emerald-500 to-teal-500',
  Converters: 'from-violet-500 to-fuchsia-500',
  'Encoders / Decoders': 'from-amber-500 to-orange-500',
  'Text Tools': 'from-rose-500 to-pink-500',
  Generators: 'from-indigo-500 to-purple-500',
  'Viewers & Utilities': 'from-sky-500 to-indigo-500',
}

const EXTRA_TOOLS = [
  { id: 'diff-check', name: 'Diff Checker', category: 'Viewers & Utilities', desc: 'Compare two texts and highlight every difference including trailing spaces and tabs.', special: true },
  { id: 'json-tree', name: 'JSON Tree Viewer', category: 'Viewers & Utilities', desc: 'Explore nested JSON as a collapsible tree.', special: true },
]
const ALL_CATEGORIES = [...CATEGORIES, 'Viewers & Utilities']
const ALL_TOOLS = [...TOOLS, ...EXTRA_TOOLS]

const highlightCode = (code, lang) => {
  if (!code) return ''
  try {
    const language = ['json', 'xml', 'yaml', 'javascript', 'css', 'sql'].includes(lang) ? lang : 'plaintext'
    return hljs.highlight(code, { language, ignoreIllegals: true }).value
  } catch {
    return code.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
  }
}

const App = () => {
  const [activeId, setActiveId] = useState('json-format')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [copiedIn, setCopiedIn] = useState(false)
  const [copiedOutTop, setCopiedOutTop] = useState(false)
  const [copiedOutBot, setCopiedOutBot] = useState(false)
  const [running, setRunning] = useState(false)
  const [dark, setDark] = useState(false)
  const [history, setHistory] = useState([])
  const [favorites, setFavorites] = useState([])
  const [showShared, setShowShared] = useState(false)
  const fileRef = useRef(null)

  const activeTool = useMemo(() => ALL_TOOLS.find((t) => t.id === activeId), [activeId])

  useEffect(() => {
    if (typeof window === 'undefined') return
    setDark(document.documentElement.classList.contains('dark'))
    try {
      const raw = localStorage.getItem('cf-history')
      if (raw) setHistory(JSON.parse(raw))
    } catch {}
    try {
      const rawF = localStorage.getItem('cf-favorites')
      if (rawF) setFavorites(JSON.parse(rawF))
    } catch {}

    const loadFromHash = () => {
      try {
        const h = window.location.hash
        if (!h || h.length < 2) return
        const params = new URLSearchParams(h.slice(1))
        const t = params.get('t')
        const d = params.get('d')
        if (t && ALL_TOOLS.find((x) => x.id === t)) {
          setActiveId(t)
          if (d) {
            const decoded = decodeURIComponent(escape(atob(d.replace(/-/g, '+').replace(/_/g, '/'))))
            setInput(decoded)
          } else {
            setInput('')
          }
          setShowShared(true)
          setTimeout(() => setShowShared(false), 3500)
        }
      } catch (e) { console.warn('share hash parse failed', e) }
    }
    loadFromHash()
    window.addEventListener('hashchange', loadFromHash)
    return () => window.removeEventListener('hashchange', loadFromHash)
  }, [])

  const saveHistory = useCallback((toolId, ip) => {
    if (!ip || !ip.trim()) return
    setHistory((h) => {
      const next = [{ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, toolId, input: ip.slice(0, 4000), ts: Date.now() }, ...h.filter((x) => !(x.toolId === toolId && x.input === ip))].slice(0, 8)
      try { localStorage.setItem('cf-history', JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const clearHistory = () => {
    setHistory([])
    try { localStorage.removeItem('cf-history') } catch {}
  }

  const toggleFavorite = (toolId) => {
    setFavorites((prev) => {
      const next = prev.includes(toolId) ? prev.filter((x) => x !== toolId) : [...prev, toolId]
      try { localStorage.setItem('cf-favorites', JSON.stringify(next)) } catch {}
      return next
    })
  }

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    if (next) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    try { localStorage.setItem('cf-theme', next ? 'dark' : 'light') } catch {}
  }

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? ALL_TOOLS.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q) ||
            t.desc.toLowerCase().includes(q),
        )
      : ALL_TOOLS
    const g = { Favorites: [] }
    for (const c of ALL_CATEGORIES) g[c] = []
    const favSet = new Set(favorites)
    for (const t of filtered) {
      if (favSet.has(t.id)) g.Favorites.push(t)
      ;(g[t.category] ||= []).push(t)
    }
    return g
  }, [query, favorites])

  const CATS_WITH_FAV = useMemo(() => (favorites.length > 0 ? ['Favorites', ...ALL_CATEGORIES] : ALL_CATEGORIES), [favorites])

  // Auto-run when tool or input changes
  useEffect(() => {
    if (!activeTool || activeTool.special) return
    if (!input && activeTool.id !== 'gen-uuid' && activeTool.id !== 'gen-ts') {
      setOutput(''); setError(''); return
    }
    let cancelled = false
    setRunning(true)
    const t = setTimeout(async () => {
      try {
        const res = await activeTool.run(input)
        if (!cancelled) { setOutput(res ?? ''); setError(''); if (input && input.trim()) saveHistory(activeTool.id, input) }
      } catch (e) {
        if (!cancelled) { setOutput(''); setError(e.message || String(e)) }
      } finally {
        if (!cancelled) setRunning(false)
      }
    }, 400)
    return () => { cancelled = true; clearTimeout(t) }
  }, [input, activeTool, saveHistory])

  const handleLoadSample = () => {
    if (activeTool?.sample !== undefined) setInput(activeTool.sample)
  }

  const handleRun = async () => {
    if (!activeTool) return
    setRunning(true)
    try {
      const res = await activeTool.run(input)
      setOutput(res ?? ''); setError('')
    } catch (e) {
      setOutput(''); setError(e.message || String(e))
    } finally { setRunning(false) }
  }

  const handleCopy = async (text, which) => {
    try {
      await navigator.clipboard.writeText(text || '')
      const setter = { in: setCopiedIn, outTop: setCopiedOutTop, outBot: setCopiedOutBot }[which]
      if (setter) { setter(true); setTimeout(() => setter(false), 1500) }
      return
    } catch {}
    // Fallback via textarea + execCommand
    try {
      const ta = document.createElement('textarea')
      ta.value = text || ''
      ta.style.position = 'fixed'; ta.style.left = '-9999px'
      document.body.appendChild(ta); ta.select()
      document.execCommand('copy'); document.body.removeChild(ta)
      const setter = { in: setCopiedIn, outTop: setCopiedOutTop, outBot: setCopiedOutBot }[which]
      if (setter) { setter(true); setTimeout(() => setter(false), 1500) }
    } catch {}
  }

  const clearInput = () => { setInput(''); setOutput(''); setError('') }
  const clearOutput = () => { setOutput(''); setError('') }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setInput(String(ev.target?.result || ''))
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleDownload = () => {
    if (!output) return
    const ext = activeTool?.ext || 'txt'
    const mimeMap = { json: 'application/json', xml: 'application/xml', html: 'text/html', css: 'text/css', js: 'application/javascript', yaml: 'application/x-yaml', csv: 'text/csv', sql: 'application/sql', txt: 'text/plain' }
    const blob = new Blob([output], { type: mimeMap[ext] || 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeTool?.id || 'output'}.${ext}`
    document.body.appendChild(a); a.click(); a.remove()
    URL.revokeObjectURL(url)
  }

  const outputHtml = useMemo(() => highlightCode(output, activeTool?.outLang), [output, activeTool])

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined' || !activeTool) return ''
    try {
      const enc = input ? btoa(unescape(encodeURIComponent(input))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : ''
      const base = `${window.location.origin}${window.location.pathname}`
      return `${base}#t=${encodeURIComponent(activeTool.id)}${enc ? `&d=${enc}` : ''}`
    } catch { return '' }
  }, [activeTool, input])

  const [copiedShare, setCopiedShare] = useState(false)
  const copyToClipboard = async (text) => {
    if (!text) return false
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        return true
      }
    } catch {}
    // Fallback for iframes / insecure contexts
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      ta.setAttribute('readonly', '')
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      return ok
    } catch { return false }
  }
  const handleShare = async () => {
    if (!shareUrl) return
    const ok = await copyToClipboard(shareUrl)
    if (ok) {
      setCopiedShare(true)
      // Also push hash into the current URL so the user can just share the address bar
      try { window.history.replaceState(null, '', shareUrl) } catch {}
      setTimeout(() => setCopiedShare(false), 2500)
    }
  }

  const loadFromHistory = (item) => {
    setActiveId(item.toolId)
    setInput(item.input)
  }

  return (
    <div className="min-h-screen transition-colors bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      {/* Top ribbon */}
      <div className="w-full bg-slate-900 text-slate-100 dark:bg-black text-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Website built by
            <a href="https://neowebsolutions.netlify.app/" target="_blank" rel="noopener noreferrer" className="font-semibold text-amber-300 hover:text-amber-200 underline underline-offset-2 inline-flex items-center gap-1">
              NeoWebSolutions <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </span>
          <span className="opacity-80 hidden sm:inline">100% free · Runs entirely in your browser · No data leaves your device</span>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div className="leading-tight">
              <div className="text-xl font-bold gradient-text">CodeFormatter</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Format · Convert · Minify · Encode</div>
            </div>
          </a>
          <nav className="hidden md:flex items-center gap-6 text-slate-600 dark:text-slate-300">
            <a href="#tools" className="hover:text-slate-900 dark:hover:text-white transition">Tools</a>
            <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition">Features</a>
            <a href="#about" className="hover:text-slate-900 dark:hover:text-white transition">About</a>
            <button suppressHydrationWarning onClick={toggleTheme} aria-label="Toggle theme" className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              {dark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <a href="https://neowebsolutions.netlify.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:opacity-90 transition">
              NeoWebSolutions <ExternalLink className="w-4 h-4" />
            </a>
          </nav>
          <button suppressHydrationWarning onClick={toggleTheme} aria-label="Toggle theme" className="md:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-700">
            {dark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-40 dark:opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute top-10 right-1/4 w-96 h-96 bg-violet-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{TOOLS.length}+ developer tools · Zero installation</span>
          </div>
          <h1 className="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Your all-in-one <span className="gradient-text">CodeFormatter</span> toolkit
          </h1>
          <p className="mt-5 text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Beautify, minify, validate and convert every popular data & code format — JSON, XML, YAML, CSV, HTML, CSS,
            JavaScript, SQL, Base64, JWT and more. Instant results, gorgeous UI, and everything runs privately in your browser.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="#tools" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:scale-[1.02] transition">
              <Rocket className="w-5 h-5" /> Open Tools
            </a>
            <a href="#features" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition">
              Why CodeFormatter?
            </a>
          </div>

          <div id="features" className="mt-14 grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
            {[
              { icon: Zap, title: 'Blazing fast', desc: 'Auto-run on every keystroke with an efficient debounced engine.' },
              { icon: Shield, title: 'Private by design', desc: 'All formatting happens locally — your data never leaves the tab.' },
              { icon: Sparkles, title: 'Beautiful output', desc: 'Syntax-highlighted, copyable results in light or dark mode.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="font-semibold text-slate-900 dark:text-white">{title}</div>
                <div className="text-slate-600 dark:text-slate-400 text-sm mt-1">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools workspace */}
      <section id="tools" className="max-w-7xl mx-auto px-4 pb-20">
        {/* Top banner ad (below hero, above tools) */}
        <AdSlot slot="hero" className="mb-6" />

        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 h-fit lg:sticky lg:top-24">
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tools..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="tool-scroll max-h-[70vh] overflow-y-auto pr-1 space-y-4">
              {CATS_WITH_FAV.map((cat) => {
                const items = grouped[cat] || []
                if (!items.length) return null
                const Icon = CATEGORY_ICONS[cat]
                return (
                  <div key={cat}>
                    <div className="flex items-center gap-2 px-1 mb-1.5">
                      <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${CATEGORY_COLORS[cat]} flex items-center justify-center`}>
                        <Icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{cat}</div>
                    </div>
                    <ul className="space-y-1">
                      {items.map((t) => {
                        const isFav = favorites.includes(t.id)
                        const isActive = activeId === t.id
                        return (
                          <li key={cat + '-' + t.id}>
                            <div className={`group flex items-center gap-1 rounded-lg transition ${
                              isActive
                                ? 'bg-gradient-to-r from-blue-600 to-violet-600 shadow shadow-blue-600/30'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}>
                              <button
                                onClick={() => { setActiveId(t.id); setInput(''); setOutput(''); setError('') }}
                                className={`flex-1 text-left pl-3 pr-1 py-2 text-sm truncate ${
                                  isActive ? 'text-white' : 'text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {t.name}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleFavorite(t.id) }}
                                aria-label={isFav ? 'Unpin from favorites' : 'Pin to favorites'}
                                title={isFav ? 'Unpin from favorites' : 'Pin to favorites'}
                                className={`px-2 py-2 rounded-md transition ${
                                  isFav
                                    ? 'text-amber-400'
                                    : isActive
                                    ? 'text-white/60 hover:text-amber-300'
                                    : 'text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 hover:text-amber-500'
                                }`}
                              >
                                <Star className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} />
                              </button>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )
              })}
            </div>

            {/* Sidebar ad (below tool list) */}
            <div className="mt-4">
              <AdSlot slot="sidebar" format="rectangle" style={{ display: 'block', minHeight: 250 }} />
            </div>
          </aside>

          {/* Main workspace */}
          <main className="space-y-4">
            {showShared && (
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 px-4 py-3 text-sm">
                Opened a shared snippet — tool and input were loaded from the link.
              </div>
            )}
            {activeTool?.id === 'diff-check' ? (
              <DiffChecker />
            ) : activeTool?.id === 'json-tree' ? (
              <JsonTree />
            ) : (
            <>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">{activeTool?.category}</div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-0.5">{activeTool?.name}</h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">{activeTool?.desc}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => toggleFavorite(activeTool.id)} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    favorites.includes(activeTool.id)
                      ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/60'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}>
                    <Star className="w-4 h-4" fill={favorites.includes(activeTool.id) ? 'currentColor' : 'none'} /> {favorites.includes(activeTool.id) ? 'Pinned' : 'Pin'}
                  </button>
                  <button onClick={handleLoadSample} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition">
                    <Sparkles className="w-4 h-4" /> Sample
                  </button>
                  <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition">
                    <Upload className="w-4 h-4" /> Upload File
                  </button>
                  <input ref={fileRef} type="file" accept=".json,.xml,.yaml,.yml,.csv,.html,.css,.js,.sql,.txt,text/*,application/json,application/xml" onChange={handleFileUpload} className="hidden" />
                  <button onClick={handleShare} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition">
                    <Share2 className="w-4 h-4" /> {copiedShare ? 'Link copied!' : 'Share'}
                  </button>
                  <button onClick={handleRun} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold shadow shadow-blue-600/30 hover:shadow-lg transition">
                    <Play className="w-4 h-4" /> {running ? 'Running...' : 'Run'}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Input panel */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="font-semibold text-slate-800 dark:text-slate-100">Input</div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm transition">
                      <Upload className="w-4 h-4" /> Upload
                    </button>
                    <button onClick={() => handleCopy(input, 'in')} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm transition">
                      {copiedIn ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      {copiedIn ? 'Copied' : 'Copy'}
                    </button>
                    <button onClick={clearInput} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm transition">
                      <Eraser className="w-4 h-4" /> Clear
                    </button>
                  </div>
                </div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Paste your ${activeTool?.name.split(' ')[0] || 'text'} here, or upload a file...`}
                  spellCheck={false}
                  className="mono w-full flex-1 min-h-[380px] p-4 text-[15px] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none resize-y"
                />
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-2xl">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => handleCopy(input, 'in')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition">
                      {copiedIn ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      {copiedIn ? 'Copied' : 'Copy'}
                    </button>
                    <button onClick={clearInput} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition">
                      <Eraser className="w-4 h-4" /> Clear
                    </button>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{input.length} chars</span>
                </div>
              </div>

              {/* Output panel */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    Output
                    {activeTool?.outLang && activeTool.outLang !== 'plaintext' && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">{activeTool.outLang}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={handleDownload} disabled={!output} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-sm transition">
                      <Download className="w-4 h-4" /> Download
                    </button>
                    <button onClick={() => handleCopy(output, 'outTop')} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm transition">
                      {copiedOutTop ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      {copiedOutTop ? 'Copied' : 'Copy'}
                    </button>
                    <button onClick={clearOutput} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm transition">
                      <Eraser className="w-4 h-4" /> Clear
                    </button>
                  </div>
                </div>
                <div className="relative flex-1 min-h-[380px] bg-slate-50 dark:bg-slate-950 overflow-auto">
                  {error ? (
                    <div className="p-4">
                      <div className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 px-4 py-3">
                        <div className="font-semibold">Error</div>
                        <div className="text-sm mt-1 mono whitespace-pre-wrap break-words">{error}</div>
                      </div>
                    </div>
                  ) : output ? (
                    <pre className="mono p-4 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                      <code className="hljs" dangerouslySetInnerHTML={{ __html: outputHtml }} />
                    </pre>
                  ) : (
                    <div className="mono p-4 text-[15px] text-slate-400 dark:text-slate-600">Your result will appear here...</div>
                  )}
                </div>
                {/* Copy & Clear buttons at the bottom of the output window */}
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-2xl">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => handleCopy(output, 'outBot')} disabled={!output} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:opacity-90 disabled:from-slate-200 disabled:to-slate-200 dark:disabled:from-slate-800 dark:disabled:to-slate-800 disabled:text-slate-400 text-sm font-medium transition">
                      {copiedOutBot ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedOutBot ? 'Copied!' : 'Copy Output'}
                    </button>
                    <button onClick={handleDownload} disabled={!output} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-200 text-sm font-medium transition">
                      <Download className="w-4 h-4" /> Download
                    </button>
                    <button onClick={clearOutput} disabled={!output && !error} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-200 text-sm font-medium transition">
                      <Eraser className="w-4 h-4" /> Clear Output
                    </button>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{output.length} chars</span>
                </div>
              </div>
            </div>
            </>
            )}

            {/* Recent History */}
            {history.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <History className="w-4 h-4" /> Recent activity
                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400">({history.length} saved locally)</span>
                  </div>
                  <button onClick={clearHistory} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm transition">
                    <Trash2 className="w-4 h-4" /> Clear all
                  </button>
                </div>
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {history.map((h) => {
                    const tool = ALL_TOOLS.find((t) => t.id === h.toolId)
                    return (
                      <li key={h.id}>
                        <button onClick={() => loadFromHistory(h)} className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 mt-2 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3">
                              <div className="font-medium text-slate-800 dark:text-slate-100 truncate">{tool?.name || h.toolId}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">{new Date(h.ts).toLocaleString()}</div>
                            </div>
                            <div className="mono text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {h.input.slice(0, 140).replace(/\n/g, ' ')}{h.input.length > 140 ? '…' : ''}
                            </div>
                          </div>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </main>
        </div>

        {/* In-content ad between workspace and About */}
        <AdSlot slot="inContent" className="mt-8" />
      </section>

      {/* About */}
      <SeoContent />
      <section id="about" className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-14 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">Everything a developer needs, in one place</h3>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              CodeFormatter bundles the most-loved developer utilities into one clean workspace. Switch between formatters, minifiers and converters with a single click — no ads, no sign-up, no data uploads. Perfect for debugging APIs, cleaning up config files or preparing production-ready assets.
            </p>
            <ul className="mt-5 space-y-2 text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2"><Check className="w-5 h-5 text-emerald-500 mt-0.5" /> Instant, keystroke-level formatting with syntax highlighting</li>
              <li className="flex items-start gap-2"><Check className="w-5 h-5 text-emerald-500 mt-0.5" /> Upload files or paste text — download results in one click</li>
              <li className="flex items-start gap-2"><Check className="w-5 h-5 text-emerald-500 mt-0.5" /> Copy & clear controls at the top and bottom of every panel</li>
              <li className="flex items-start gap-2"><Check className="w-5 h-5 text-emerald-500 mt-0.5" /> Popular converters like XML ↔ JSON, YAML ↔ JSON, CSV ↔ JSON</li>
              <li className="flex items-start gap-2"><Check className="w-5 h-5 text-emerald-500 mt-0.5" /> Encoders for Base64, URL, HTML entities and JWT tokens</li>
              <li className="flex items-start gap-2"><Check className="w-5 h-5 text-emerald-500 mt-0.5" /> Beautiful light & dark themes with instant switching</li>
            </ul>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 p-1 shadow-2xl shadow-blue-600/30">
            <div className="rounded-3xl bg-slate-900 text-slate-100 p-6 mono text-sm">
              <div className="flex gap-1.5 mb-4">
                <span className="w-3 h-3 rounded-full bg-red-400"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                <span className="w-3 h-3 rounded-full bg-green-400"></span>
              </div>
              <pre className="whitespace-pre-wrap">
<span className="text-slate-400">{`// XML to JSON — one click.`}</span>{'\n'}
<span className="text-fuchsia-300">{`<user>`}</span>{'\n'}
{`  `}<span className="text-fuchsia-300">{`<name>`}</span><span className="text-emerald-300">Ada</span><span className="text-fuchsia-300">{`</name>`}</span>{'\n'}
{`  `}<span className="text-fuchsia-300">{`<age>`}</span><span className="text-amber-300">36</span><span className="text-fuchsia-300">{`</age>`}</span>{'\n'}
<span className="text-fuchsia-300">{`</user>`}</span>{'\n\n'}
<span className="text-emerald-300">{`// becomes`}</span>{'\n'}
{`{
  "user": {
    "name": "Ada",
    "age": 36
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-black text-slate-300">
        {/* Bottom banner ad above footer */}
        <div className="max-w-7xl mx-auto px-4 pt-8">
          <AdSlot slot="footer" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <div className="text-lg font-bold text-white">CodeFormatter</div>
            </div>
            <p className="mt-3 text-slate-400">
              A free suite of developer utilities to format, convert and clean your code — right in the browser.
            </p>
          </div>
          <div>
            <div className="text-white font-semibold mb-3">Categories</div>
            <ul className="space-y-2 text-slate-400">
              {CATEGORIES.map((c) => (
                <li key={c}><a href="#tools" className="hover:text-white transition">{c}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-white font-semibold mb-3">Legal</div>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="hover:text-white transition">Cookie Policy</Link></li>
              <li><a href="https://neowebsolutions.netlify.app/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>
          <div>
            <div className="text-white font-semibold mb-3">Built by NeoWebSolutions</div>
            <p className="text-slate-400">
              This project is designed and maintained by NeoWebSolutions — a studio building fast, delightful web experiences.
            </p>
            <a href="https://neowebsolutions.netlify.app/" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white font-medium hover:opacity-90 transition">
              Visit NeoWebSolutions <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
        <div className="border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-5 text-sm text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <span>© {new Date().getFullYear()} CodeFormatter. All rights reserved.</span>
            <span>
              Built with ❤ by{' '}
              <a href="https://neowebsolutions.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-amber-300 underline underline-offset-2">
                NeoWebSolutions
              </a>
            </span>
          </div>
        </div>
      </footer>

      {/* Cookie consent banner (only shown until user chooses) */}
      <CookieConsent />
    </div>
  )
}

export default App
