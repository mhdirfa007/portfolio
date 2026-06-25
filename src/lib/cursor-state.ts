// Shared cursor position state for moving the 3D mouse based on real cursor.
// This is a module-level mutable object (not React state) so it can be read
// inside useFrame loops without triggering re-renders on every mouse move.

export type CursorState = {
  // Normalized cursor position over the canvas: x in [-1, 1], y in [-1, 1]
  // (0, 0) = center of canvas, (1, 1) = top-right, (-1, -1) = bottom-left
  x: number
  y: number
  // Whether the cursor is currently over the canvas (so we can "park" the
  // mouse when the user moves away)
  active: boolean
}

export const cursorState: { current: CursorState } = {
  current: { x: 0, y: 0, active: false },
}

export function updateCursor(x: number, y: number, active: boolean) {
  cursorState.current = { x, y, active }
}
