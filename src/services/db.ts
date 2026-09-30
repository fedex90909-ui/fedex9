/** Utility functions for ID and reference generation. */

export function uid(prefix: string): string {
  let rand = ''
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint8Array(8)
    crypto.getRandomValues(buf)
    rand = Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('')
  } else {
    rand = Math.random().toString(16).slice(2, 18).padEnd(16, '0')
  }
  return `${prefix}_${Date.now().toString(36)}${rand}`
}

export function randomDigits(count: number): string {
  let out = ''
  for (let i = 0; i < count; i++) {
    const buf = new Uint32Array(1)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(buf)
      out += String(buf[0] % 10)
    } else {
      out += String(Math.floor(Math.random() * 10))
    }
  }
  return out
}

const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function randomChars(count: number): string {
  let out = ''
  for (let i = 0; i < count; i++) {
    const buf = new Uint32Array(1)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(buf)
      out += REF_ALPHABET[buf[0] % REF_ALPHABET.length]
    } else {
      out += REF_ALPHABET[Math.floor(Math.random() * REF_ALPHABET.length)]
    }
  }
  return out
}

export function newTrackingNumber(): string {
  return `7946${randomDigits(8)}`
}

export function newReference(prefix = 'FX'): string {
  return `${prefix}-${randomChars(4)}-${randomChars(4)}`
}
