import { MaterialIcons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title: "นโยบายความเป็นส่วนตัว",
          headerTitleStyle: {
            fontFamily: "Kanit-SemiBold",
            fontSize: 18,
          },
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.lastUpdated}>อัปเดตล่าสุด: 24 พฤศจิกายน 2568</Text>
          <Text style={styles.paragraph}>
            แอปพลิเคชัน WeighPay ให้ความสำคัญกับความเป็นส่วนตัวของผู้ใช้
            นโยบายนี้อธิบายวิธีที่เราเก็บรวบรวม ใช้ และปกป้องข้อมูลของท่าน
          </Text>
        </View>

        {/* Section 1: Data Collection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. ข้อมูลที่เราเก็บรวบรวม</Text>
          <Text style={styles.paragraph}>เราเก็บรวบรวมข้อมูลดังต่อไปนี้:</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              • <Text style={styles.bold}>หมายเลข PromptPay:</Text> สำหรับรับชำระเงิน
            </Text>
            <Text style={styles.bulletItem}>
              • <Text style={styles.bold}>ประวัติการขาย:</Text> รายการขาย น้ำหนัก และราคา
            </Text>
            <Text style={styles.bulletItem}>
              • <Text style={styles.bold}>ข้อมูลผลไม้:</Text> ชนิด ราคาต่อกิโลกรัม และไอคอน
            </Text>
            <Text style={styles.bulletItem}>
              • <Text style={styles.bold}>ข้อมูลบัญชี:</Text> อีเมลและชื่อผู้ใช้
            </Text>
          </View>
        </View>

        {/* Section 2: Purpose */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. วัตถุประสงค์ในการใช้ข้อมูล</Text>
          <Text style={styles.paragraph}>เราใช้ข้อมูลของท่านเพื่อ:</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• คำนวณราคาสินค้าตามน้ำหนัก</Text>
            <Text style={styles.bulletItem}>• สร้าง QR Code สำหรับการชำระเงินผ่าน PromptPay</Text>
            <Text style={styles.bulletItem}>• แสดงประวัติการขายและสรุปยอดประจำวัน</Text>
            <Text style={styles.bulletItem}>• ปรับปรุงประสบการณ์การใช้งานแอป</Text>
          </View>
        </View>

        {/* Section 3: Data Storage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. การเก็บรักษาข้อมูล</Text>
          <Text style={styles.paragraph}>
            ข้อมูลของท่านถูกเก็บรักษาอย่างปลอดภัย:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>
              • เซิร์ฟเวอร์ที่มีมาตรฐานความปลอดภัยสูง
            </Text>
            <Text style={styles.bulletItem}>
              • การเข้ารหัสข้อมูลด้วย SSL/TLS
            </Text>
            <Text style={styles.bulletItem}>
              • การยืนยันตัวตนด้วย JWT Token
            </Text>
            <Text style={styles.bulletItem}>
              • ข้อมูลที่ละเอียดอ่อนถูกจัดเก็บในอุปกรณ์อย่างปลอดภัย
            </Text>
          </View>
        </View>

        {/* Section 4: User Rights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. สิทธิ์ของผู้ใช้</Text>
          <Text style={styles.paragraph}>ท่านมีสิทธิ์:</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• เข้าถึงข้อมูลส่วนบุคคลของท่าน</Text>
            <Text style={styles.bulletItem}>• ขอแก้ไขข้อมูลที่ไม่ถูกต้อง</Text>
            <Text style={styles.bulletItem}>• ขอลบบัญชีและข้อมูลทั้งหมด</Text>
            <Text style={styles.bulletItem}>• ขอสำเนาข้อมูลของท่าน</Text>
            <Text style={styles.bulletItem}>• ปฏิเสธการใช้ข้อมูลเพื่อการตลาด</Text>
          </View>
        </View>

        {/* Section 5: Data Sharing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. การแบ่งปันข้อมูล</Text>
          <Text style={styles.paragraph}>
            เราไม่ขายหรือเปิดเผยข้อมูลส่วนบุคคลของท่านแก่บุคคลที่สาม
            ยกเว้นในกรณีที่กฎหมายกำหนดหรือเพื่อการดำเนินงานของแอป
          </Text>
        </View>

        {/* Section 6: Updates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. การเปลี่ยนแปลงนโยบาย</Text>
          <Text style={styles.paragraph}>
            เราอาจปรับปรุงนโยบายความเป็นส่วนตัวเป็นครั้งคราว
            การเปลี่ยนแปลงจะมีผลเมื่อเผยแพร่ในแอป
            ท่านควรตรวจสอบนโยบายนี้เป็นระยะ
          </Text>
        </View>

        {/* Section 7: Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. ติดต่อเรา</Text>
          <Text style={styles.paragraph}>
            หากท่านมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัว หรือต้องการใช้สิทธิ์ตามที่ระบุข้างต้น
            กรุณาติดต่อเราที่:
          </Text>
          <View style={styles.contactCard}>
            <View style={styles.contactRow}>
              <MaterialIcons name="email" size={20} color="#B46A07" />
              <Text style={styles.contactText}>durico888@gmail.com</Text>
            </View>
          </View>
        </View>

        {/* Footer spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  lastUpdated: {
    fontSize: 12,
    fontFamily: "Kanit-Regular",
    color: "#6b7280",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Kanit-SemiBold",
    color: "#1f2937",
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    fontFamily: "Kanit-Regular",
    color: "#374151",
    lineHeight: 24,
    marginBottom: 8,
  },
  bulletList: {
    marginTop: 4,
  },
  bulletItem: {
    fontSize: 14,
    fontFamily: "Kanit-Regular",
    color: "#374151",
    lineHeight: 24,
    marginBottom: 4,
    paddingLeft: 8,
  },
  bold: {
    fontFamily: "Kanit-SemiBold",
    color: "#1f2937",
  },
  contactCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  contactText: {
    fontSize: 14,
    fontFamily: "Kanit-Regular",
    color: "#B46A07",
  },
});
