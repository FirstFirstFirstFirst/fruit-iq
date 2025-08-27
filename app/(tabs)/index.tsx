import React from 'react'
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native'
import { MaterialIcons, Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#B46A07', '#D97706']}
        style={styles.gradient}
      >
          {/* Hero Section */}
          <View style={styles.hero}>
            <View style={styles.logoContainer}>
              <MaterialIcons name="scale" size={60} color="white" />
            </View>
            <Text style={styles.heroTitle}>WeighPay</Text>
            <Text style={styles.heroSubtitle}>
              ระบบชั่งน้ำหนักและคำนวณราคา{'\n'}ผลไม้อัจฉริยะ
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>วิธีใช้งาน</Text>
            
            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Feather name="camera" size={26} color="#B46A07" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>1. สแกนน้ำหนักผลไม้</Text>
                <Text style={styles.featureDescription}>
                  ตรวจจับน้ำหนักผลไม้อัตโนมัติ
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <MaterialIcons name="shopping-cart" size={26} color="#B46A07" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>2. เลือกผลไม้และคำนวณราคา</Text>
                <Text style={styles.featureDescription}>
                  เลือกผลไม้และคำนวณราคาอัตโนมัติ
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <MaterialIcons name="qr-code" size={26} color="#B46A07" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>3. รับชำระเงินผ่าน QR Code</Text>
                <Text style={styles.featureDescription}>
                  สร้าง QR Code PromptPay และรับชำระเงิน
                </Text>
              </View>
            </View>
          </View>

          {/* CTA Button */}
          <View style={styles.ctaContainer}>
            <TouchableOpacity 
              style={styles.ctaButton} 
              onPress={() => router.push('/(tabs)/camera')}
            >
              <MaterialIcons name="play-arrow" size={20} color="white" />
              <Text style={styles.ctaText}>เริ่มใช้งาน</Text>
            </TouchableOpacity>
          </View>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 24,
    flex: 1,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureContent: {
    flex: 1,
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  ctaContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  ctaButton: {
    backgroundColor: '#B46A07',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B46A07',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 150,
  },
  ctaText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
})