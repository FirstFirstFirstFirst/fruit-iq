export const PRESET_EMOJIS = [
  '🍎', '🍊', '🍌', '🥭', '🍇', '🍓', '🥥', '🍍',
  '🫐', '🍈', '🍑', '🥝', '🍋', '🍐', '🥑', '🍅',
  '🥒', '🌶️', '🫑', '🥕'
] as const

export type CameraStep =
  | 'scan'
  | 'camera'
  | 'confirm-photo'
  | 'select'
  | 'weight'
  | 'confirm'
  | 'qr-payment'
  | 'success'
  | 'add-fruit'

export interface CropSelection {
  x: number
  y: number
  width: number
  height: number
}