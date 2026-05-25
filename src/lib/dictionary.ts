export interface DictionaryEntry {
  word: string
  lemma: string | null
  article: string | null
  part_of_speech: string
  ipa: string | null
  german_definition: string
  english_translations: string[]
  grammar_notes: string | null
  plural: string | null
  conjugation: string | null
  examples: Array<{ de: string; en: string }>
  related_words: string[]
}

export interface LookupResult {
  entry: DictionaryEntry
  cached: boolean
}

const CACHE_KEY = "dict_cache"
const API_BASE = "https://dict.germanweekly.com/api/lookup"

function getCache(): Record<string, DictionaryEntry> {
  if (typeof window === "undefined") return {}
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}")
  } catch {
    return {}
  }
}

function setCache(cache: Record<string, DictionaryEntry>): void {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
}

export async function lookupWord(word: string): Promise<LookupResult> {
  const cache = getCache()
  const cached = cache[word.toLowerCase()]
  if (cached) return { entry: cached, cached: true }

  const res = await fetch(`${API_BASE}/${encodeURIComponent(word)}`)
  if (!res.ok) throw new Error(`Lookup failed: ${res.statusText}`)
  const data: LookupResult = await res.json()

  const newCache = { ...getCache(), [word.toLowerCase()]: data.entry }
  setCache(newCache)
  return data
}
