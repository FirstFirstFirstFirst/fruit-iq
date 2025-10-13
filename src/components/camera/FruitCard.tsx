import { Fruit } from "@/src/lib/api";
import { formatThaiCurrency, getEmojiById } from "@/src/lib/utils";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View, Image } from "react-native";
import { cameraStyles } from "./styles";

interface FruitCardProps {
  fruit: Fruit;
  onSelect: (fruitId: number) => void;
  onLongPress: (fruitId: number) => void;
}

export default function FruitCard({
  fruit,
  onSelect,
  onLongPress,
}: FruitCardProps) {
  const emojiItem = getEmojiById(fruit.emoji);

  return (
    <TouchableOpacity
      style={cameraStyles.improvedFruitCard}
      onPress={() => onSelect(fruit.fruitId)}
      onLongPress={() => onLongPress(fruit.fruitId)}
      activeOpacity={0.8}
    >
      <View style={cameraStyles.fruitImageContainer}>
        {emojiItem?.type === 'emoji' ? (
          <Text style={cameraStyles.improvedFruitEmoji}>{emojiItem.value}</Text>
        ) : emojiItem?.type === 'image' ? (
          <Image
            source={emojiItem.source}
            style={{ width: 48, height: 48 }}
            resizeMode="contain"
          />
        ) : (
          <Text style={cameraStyles.improvedFruitEmoji}>🍎</Text>
        )}
      </View>
      <View style={cameraStyles.improvedFruitInfo}>
        <Text style={cameraStyles.improvedFruitName}>{fruit.nameThai}</Text>
        <Text style={cameraStyles.improvedFruitPrice}>
          {formatThaiCurrency(fruit.pricePerKg)}/กก.
        </Text>
      </View>
      <View style={cameraStyles.selectIndicator}>
        <MaterialIcons name="touch-app" size={16} color="#B46A07" />
      </View>
    </TouchableOpacity>
  );
}
