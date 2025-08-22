import React from 'react'
import { View, Text, SafeAreaView, ScrollView, StyleSheet } from 'react-native'
import { Button } from '../../src/components/ui/Button'
import { MaterialIcons, Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#B46A07', '#D97706']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View style={styles.hero}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="analytics" size={60} color="white" />
            </View>
            <Text style={styles.heroTitle}>Fruit IQ</Text>
            <Text style={styles.heroSubtitle}>
              ระบบชั่งน้ำหนักและคำนวณราคา{'\n'}ผลไม้อัจฉริยะ
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>เริ่มต้นใช้งาน</Text>
            
            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Feather name="camera" size={24} color="#B46A07" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>1. ถ่ายรูปที่ชั่งดิจิทัล</Text>
                <Text style={styles.featureDescription}>
                  ตรวจจับน้ำหนักผลไม้
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <MaterialIcons name="shopping-cart" size={24} color="#B46A07" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>2. เลือกผลไม้</Text>
                <Text style={styles.featureDescription}>
                  คำนวณราคาอัตโนมัติ
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <MaterialIcons name="receipt" size={24} color="#B46A07" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>3. ดูยอดขาย</Text>
                <Text style={styles.featureDescription}>
                  สถิติการขายเรียลไทม์
                </Text>
              </View>
            </View>
          </View>

          {/* CTA Button */}
          <View style={styles.ctaContainer}>
            <Button size="lg" onPress={() => {}}>
              <View style={styles.ctaContent}>
                <MaterialIcons name="play-arrow" size={24} color="white" />
                <Text style={styles.ctaText}>เริ่มใช้งาน</Text>
              </View>
            </Button>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 32,
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
    paddingTop: 32,
    paddingHorizontal: 24,
    flex: 1,
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 24,
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
    width: 60,
    height: 60,
    borderRadius: 30,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  ctaContainer: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: 'white',
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
})