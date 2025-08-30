import { Feather, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { height } = Dimensions.get('window');
  const isSmallScreen = height < 700;
  const [isScrollable, setIsScrollable] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#B46A07", "#D97706"]} style={styles.gradient}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          bounces={true}
          onScroll={(event) => {
            const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
            const isScrollableContent = contentSize.height > layoutMeasurement.height;
            setIsScrollable(isScrollableContent);
            
            // Hide scroll hint after user starts scrolling
            if (contentOffset.y > 20) {
              setShowScrollHint(false);
            }
          }}
          scrollEventThrottle={16}
          contentContainerStyle={[
            styles.scrollContent,
            { minHeight: height - 100 }
          ]}
        >
          {/* Hero Section */}
          <View style={[styles.hero, isSmallScreen && styles.heroSmall]}>
            <View style={[styles.logoContainer, isSmallScreen && styles.logoContainerSmall]}>
              <MaterialIcons name="scale" size={isSmallScreen ? 48 : 60} color="white" />
            </View>
            <Text style={[styles.heroTitle, isSmallScreen && styles.heroTitleSmall]}>WeighPay</Text>
            <Text style={[styles.heroSubtitle, isSmallScreen && styles.heroSubtitleSmall]}>
              ระบบชั่งน้ำหนักและคำนวณราคา{"\n"}ผลไม้อัจฉริยะ
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <Text style={[styles.featuresTitle, isSmallScreen && styles.featuresTitleSmall]}>วิธีใช้งาน</Text>

            <View style={[styles.featureCard, isSmallScreen && styles.featureCardSmall]}>
              <View style={[styles.featureIcon, isSmallScreen && styles.featureIconSmall]}>
                <Feather name="camera" size={isSmallScreen ? 20 : 26} color="#B46A07" />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, isSmallScreen && styles.featureTitleSmall]}>1. สแกนน้ำหนักผลไม้</Text>
                <Text style={[styles.featureDescription, isSmallScreen && styles.featureDescriptionSmall]}>
                  ตรวจจับน้ำหนักผลไม้อัตโนมัติ
                </Text>
              </View>
            </View>

            <View style={[styles.featureCard, isSmallScreen && styles.featureCardSmall]}>
              <View style={[styles.featureIcon, isSmallScreen && styles.featureIconSmall]}>
                <MaterialIcons name="shopping-cart" size={isSmallScreen ? 20 : 26} color="#B46A07" />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, isSmallScreen && styles.featureTitleSmall]}>2. เลือกผลไม้และคำนวณราคา</Text>
                <Text style={[styles.featureDescription, isSmallScreen && styles.featureDescriptionSmall]}>
                  เลือกผลไม้และคำนวณราคาอัตโนมัติ
                </Text>
              </View>
            </View>

            <View style={[styles.featureCard, isSmallScreen && styles.featureCardSmall]}>
              <View style={[styles.featureIcon, isSmallScreen && styles.featureIconSmall]}>
                <MaterialIcons name="qr-code" size={isSmallScreen ? 20 : 26} color="#B46A07" />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, isSmallScreen && styles.featureTitleSmall]}>
                  3. รับชำระเงินผ่าน QR Code
                </Text>
                <Text style={[styles.featureDescription, isSmallScreen && styles.featureDescriptionSmall]}>
                  สร้าง QR Code PromptPay
                </Text>
              </View> 
            </View>
          </View>

          {/* CTA Button */}
          <View style={[styles.ctaContainer, isSmallScreen && styles.ctaContainerSmall]}>
            <TouchableOpacity
              style={[styles.ctaButton, isSmallScreen && styles.ctaButtonSmall]}
              onPress={() => router.push("/(tabs)/camera")}
            >
              <MaterialIcons name="play-arrow" size={20} color="white" />
              <Text style={[styles.ctaText, isSmallScreen && styles.ctaTextSmall]}>เริ่มใช้งาน</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        
        {/* Scroll Hint Indicator */}
        {isScrollable && showScrollHint && (
          <View style={[styles.scrollHint, { bottom: 100 }]}>
            <View style={styles.scrollDots}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
            <Text style={styles.scrollHintText}>เลื่อนลงเพื่อดูเพิ่มเติม</Text>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  hero: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  heroSmall: {
    paddingTop: 30,
    paddingBottom: 15,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  logoContainerSmall: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: "Kanit-Bold",
    color: "white",
    marginBottom: 12,
  },
  heroTitleSmall: {
    fontSize: 24,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: "Kanit-Regular",
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 24,
  },
  heroSubtitleSmall: {
    fontSize: 14,
    lineHeight: 20,
  },
  featuresContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  featuresTitle: {
    fontSize: 20,
    fontFamily: "Kanit-SemiBold",
    color: "#1f2937",
    marginBottom: 20,
    textAlign: "center",
  },
  featuresTitleSmall: {
    fontSize: 18,
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  featureCardSmall: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIconSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
    justifyContent: "center",
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: "Kanit-SemiBold",
    color: "#1f2937",
    marginBottom: 6,
  },
  featureTitleSmall: {
    fontSize: 14,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: "Kanit-Regular",
    color: "#6b7280",
    lineHeight: 20,
  },
  featureDescriptionSmall: {
    fontSize: 12,
    lineHeight: 16,
  },
  ctaContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: "white",
    alignItems: "center",
    marginTop: 'auto',
  },
  ctaContainerSmall: {
    paddingVertical: 16,
  },
  ctaButton: {
    backgroundColor: "#B46A07",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#B46A07",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 150,
  },
  ctaButtonSmall: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    minWidth: 120,
  },
  ctaText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Kanit-SemiBold",
    marginLeft: 6,
  },
  ctaTextSmall: {
    fontSize: 14,
  },
  scrollHint: {
    position: "absolute",
    right: 20,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollDots: {
    flexDirection: "row",
    marginBottom: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#d1d5db",
    marginHorizontal: 2,
  },
  dotActive: {
    backgroundColor: "#B46A07",
  },
  scrollHintText: {
    fontSize: 10,
    color: "#6b7280",
    fontFamily: "Kanit-Regular",
    textAlign: "center",
  },
});
