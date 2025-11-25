import { ImageSourcePropType } from "react-native";

export type PresetEmojiItem =
  | { type: "emoji"; value: string; id: string }
  | { type: "image"; source: ImageSourcePropType; id: string };

export const PRESET_EMOJIS: PresetEmojiItem[] = [
  { type: "emoji", value: "🍎", id: "apple" },
  { type: "emoji", value: "🍊", id: "orange" },
  { type: "emoji", value: "🍌", id: "banana" },
  { type: "emoji", value: "🥭", id: "mango" },
  { type: "emoji", value: "🍇", id: "grapes" },
  { type: "emoji", value: "🍓", id: "strawberry" },
  { type: "emoji", value: "🥥", id: "coconut" },
  { type: "emoji", value: "🍍", id: "pineapple" },
  { type: "emoji", value: "🫐", id: "blueberry" },
  { type: "emoji", value: "🍈", id: "melon" },
  { type: "emoji", value: "🍑", id: "peach" },
  { type: "emoji", value: "🥝", id: "kiwi" },
  { type: "emoji", value: "🍋", id: "lemon" },
  { type: "emoji", value: "🍐", id: "pear" },
  { type: "emoji", value: "🥑", id: "avocado" },
  { type: "emoji", value: "🍅", id: "tomato" },
  { type: "emoji", value: "🥒", id: "cucumber" },
  { type: "emoji", value: "🌶️", id: "pepper" },
  { type: "emoji", value: "🥕", id: "carrot" },
  {
    type: "image",
    source: require("../../../assets/images/durian-emoji.png"),
    id: "durian",
  },
];

export type CameraStep =
  | "scan"
  | "camera"
  | "select"
  | "weight"
  | "confirm"
  | "cart-review"
  | "qr-payment"
  | "success"
  | "add-fruit";
