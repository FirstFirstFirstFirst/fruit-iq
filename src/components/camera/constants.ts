export const PRESET_EMOJIS = [
  '🍎', '🍊', '🍌', '🥭', '🍇', '🍓', '🥥', '🍍',
  '🫐', '🍈', '🍑', '🥝', '🍋', '🍐', '🥑', '🍅',
  '🥒', '🌶️', '🫑', '🥕'
] as const

export type CameraStep =
  | 'scan'
  | 'camera'
  | 'select'
  | 'weight'
  | 'confirm'
  | 'qr-payment'
  | 'success'
  | 'add-fruit'