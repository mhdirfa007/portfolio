// Shared input state for syncing real keyboard typing with the 3D keyboard
// and cartoon hand finger animations.
//
// This is a module-level mutable object (not React state) so it can be read
// inside useFrame loops without triggering re-renders on every keypress.

export type PressState = {
  // The 3D keyboard key that was pressed (e.g. 'Q', 'A', 'SPACE', 'ENT')
  keyId: string | null
  // Which finger pressed it (0-7):
  //   0 = left pinky,  1 = left ring,  2 = left middle,  3 = left index
  //   4 = right index, 5 = right middle, 6 = right ring,  7 = right pinky
  fingerId: number | null
  // High-resolution timestamp (ms) of the press — used by useFrame to compute
  // how far into the press animation we are.
  timestamp: number
}

export const inputState: { current: PressState } = {
  current: {
    keyId: null,
    fingerId: null,
    timestamp: 0,
  },
}

export function triggerKeyPress(keyId: string, fingerId: number) {
  inputState.current = {
    keyId,
    fingerId,
    timestamp: typeof performance !== 'undefined' ? performance.now() : Date.now(),
  }
}

/* ============================================================================
   Keyboard layout + finger mapping
   The 3D keyboard has 5 rows. Each key is assigned to a finger based on
   standard touch-typing rules.
============================================================================ */

export const KEYBOARD_LAYOUT: string[][] = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'BSP'],
  ['TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
  ['CAP', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'ENT', ''],
  ['SHF', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'SHF', '', ''],
  ['CTL', 'WIN', 'ALT', 'SPC', 'SPC', 'SPC', 'SPC', 'SPC', 'SPC', 'ALT', 'WIN', 'MNU', 'CTL', ''],
]

// Maps a physical key (lowercase) → { row, col, fingerId }
// Built once from KEYBOARD_LAYOUT + finger rules.
const KEY_LOOKUP: Record<string, { row: number; col: number; fingerId: number }> = (() => {
  const lookup: Record<string, { row: number; col: number; fingerId: number }> = {}

  // Finger assignment per column (rough standard touch-typing zones):
  //   Cols 0-1   → left pinky (0)
  //   Col  2     → left ring (1)
  //   Col  3     → left middle (2)
  //   Cols 4-5   → left index (3)
  //   Cols 6-7   → right index (4)
  //   Col  8     → right middle (5)
  //   Col  9     → right ring (6)
  //   Cols 10-13 → right pinky (7)
  const fingerForCol = (col: number): number => {
    if (col <= 1) return 0
    if (col === 2) return 1
    if (col === 3) return 2
    if (col <= 5) return 3
    if (col <= 7) return 4
    if (col === 8) return 5
    if (col === 9) return 6
    return 7
  }

  KEYBOARD_LAYOUT.forEach((row, rIdx) => {
    row.forEach((k, cIdx) => {
      if (k === '') return
      // For the spacebar (SPC), all instances map to thumb — we use finger 3
      // (left index) as a stand-in so the left hand dips slightly. Could also
      // alternate, but keeping it simple.
      const fingerId = k === 'SPC' ? 3 : fingerForCol(cIdx)
      // Only record the FIRST occurrence of each key (handles duplicates like
      // 'SHF' appearing twice — the left shift is the one we want to animate).
      const key = k.toLowerCase()
      if (!lookup[key]) {
        lookup[key] = { row: rIdx, col: cIdx, fingerId }
      }
    })
  })

  return lookup
})()

// Maps a browser KeyboardEvent.key to our keyId.
// Returns null for keys we don't track (e.g. F1-F12, arrow keys).
export function keyEventToKeyId(event: KeyboardEvent): string | null {
  const k = event.key

  // Special keys
  if (k === 'Backspace') return 'BSP'
  if (k === 'Tab') return 'TAB'
  if (k === 'CapsLock') return 'CAP'
  if (k === 'Enter') return 'ENT'
  if (k === 'Shift') return 'SHF'
  if (k === 'Control') return 'CTL'
  if (k === 'Meta') return 'WIN'
  if (k === 'Alt') return 'ALT'
  if (k === ' ') return 'SPC'

  // Printable single-char keys
  if (k.length === 1) {
    return k.toLowerCase()
  }

  return null
}

export function lookupKeyPress(keyId: string): { row: number; col: number; fingerId: number } | null {
  return KEY_LOOKUP[keyId.toLowerCase()] ?? null
}

/* ============================================================================
   Finger → hand mapping
   fingerId 0-3 → left hand (side: 'left'), finger index 0-3 within that hand
   fingerId 4-7 → right hand (side: 'right'), finger index 0-3 within that hand
   fingerId 3 from left hand also handles the spacebar (thumb stand-in).
============================================================================ */

export function fingerIdToHand(fingerId: number): { side: 'left' | 'right'; index: number } {
  if (fingerId <= 3) return { side: 'left', index: fingerId }
  return { side: 'right', index: fingerId - 4 }
}

/* ============================================================================
   Mouse cursor position state
   Tracks the user's real cursor position (normalized to -1..1 range) so the
   3D mouse on the desk can follow it. Module-level mutable object so it can
   be read inside useFrame without triggering re-renders.
============================================================================ */

export type MousePosState = {
  // Normalized cursor position: x in [-1, 1] (left to right), y in [-1, 1] (bottom to top)
  // Note: browser Y is inverted (top = 0), so we flip it here.
  x: number
  y: number
  // Whether the cursor is currently over the canvas
  active: boolean
}

export const mousePosState: { current: MousePosState } = {
  current: {
    x: 0,
    y: 0,
    active: false,
  },
}

export function updateMousePos(x: number, y: number, active: boolean) {
  mousePosState.current = { x, y, active }
}

