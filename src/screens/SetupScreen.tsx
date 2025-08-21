import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, SafeAreaView } from 'react-native';
import { Button, Card, CardContent, CardHeader, Input } from '~/components/ui';
import { useFruits } from '~/hooks/useFruits';
import { THAI_TEXT } from '~/lib/constants';
import { formatCurrency } from '~/lib/utils';

export function SetupScreen({ navigation }: any) {
  const { fruits, loading, addFruit, updateFruit, deleteFruit, loadPresets } = useFruits();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFruit, setEditingFruit] = useState<any>(null);
  const [formData, setFormData] = useState({
    name_thai: '',
    name_english: '',
    price_per_kg: '',
  });

  useEffect(() => {
    loadPresets();
  }, []);

  const handleAddFruit = async () => {
    if (!formData.name_thai || !formData.price_per_kg) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกชื่อผลไม้และราคา');
      return;
    }

    try {
      await addFruit(
        formData.name_thai,
        formData.name_english,
        parseFloat(formData.price_per_kg)
      );
      resetForm();
      Alert.alert('สำเร็จ', 'เพิ่มผลไม้เรียบร้อย');
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเพิ่มผลไม้ได้');
    }
  };

  const handleUpdateFruit = async () => {
    if (!editingFruit || !formData.name_thai || !formData.price_per_kg) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกข้อมูลให้ครบ');
      return;
    }

    try {
      await updateFruit(editingFruit.id, {
        name_thai: formData.name_thai,
        name_english: formData.name_english,
        price_per_kg: parseFloat(formData.price_per_kg),
      });
      resetForm();
      Alert.alert('สำเร็จ', 'แก้ไขผลไม้เรียบร้อย');
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถแก้ไขผลไม้ได้');
    }
  };

  const handleDeleteFruit = (fruit: any) => {
    Alert.alert(
      'ยืนยันการลบ',
      `คุณต้องการลบ ${fruit.name_thai} หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบ',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFruit(fruit.id);
              Alert.alert('สำเร็จ', 'ลบผลไม้เรียบร้อย');
            } catch (error) {
              Alert.alert('ข้อผิดพลาด', 'ไม่สามารถลบผลไม้ได้');
            }
          },
        },
      ]
    );
  };

  const startEdit = (fruit: any) => {
    setEditingFruit(fruit);
    setFormData({
      name_thai: fruit.name_thai,
      name_english: fruit.name_english || '',
      price_per_kg: fruit.price_per_kg.toString(),
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({ name_thai: '', name_english: '', price_per_kg: '' });
    setShowAddForm(false);
    setEditingFruit(null);
  };

  const renderFruitItem = ({ item }: { item: any }) => (
    <Card className="mb-4">
      <CardContent className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-xl font-bold text-foreground">
            {item.name_thai}
          </Text>
          {item.name_english && (
            <Text className="text-base text-muted-foreground">
              {item.name_english}
            </Text>
          )}
          <Text className="text-lg font-semibold text-primary mt-1">
            {formatCurrency(item.price_per_kg)}/กก.
          </Text>
        </View>
        <View className="flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            onPress={() => startEdit(item)}
          >
            แก้ไข
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onPress={() => handleDeleteFruit(item)}
          >
            ลบ
          </Button>
        </View>
      </CardContent>
    </Card>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-4">
        <Card className="mb-6">
          <CardHeader>
            <Text className="text-2xl font-bold text-center text-foreground">
              {THAI_TEXT.setup}
            </Text>
            <Text className="text-base text-center text-muted-foreground mt-2">
              ตั้งค่าผลไม้และราคาของคุณ
            </Text>
          </CardHeader>
        </Card>

        {!showAddForm ? (
          <View className="mb-4">
            <Button
              onPress={() => setShowAddForm(true)}
              className="mb-4"
              size="lg"
            >
              + {THAI_TEXT.addFruit}
            </Button>
          </View>
        ) : (
          <Card className="mb-6">
            <CardContent>
              <Text className="text-xl font-bold text-foreground mb-4">
                {editingFruit ? THAI_TEXT.editFruit : THAI_TEXT.addFruit}
              </Text>
              
              <Input
                label="ชื่อผลไม้ (ภาษาไทย) *"
                value={formData.name_thai}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name_thai: text }))}
                placeholder="เช่น มะม่วง"
                className="mb-4"
              />

              <Input
                label="ชื่อผลไม้ (ภาษาอังกฤษ)"
                value={formData.name_english}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name_english: text }))}
                placeholder="เช่น Mango"
                className="mb-4"
              />

              <Input
                label="ราคาต่อกิโลกรัม (บาท) *"
                value={formData.price_per_kg}
                onChangeText={(text) => setFormData(prev => ({ ...prev, price_per_kg: text }))}
                placeholder="เช่น 60"
                keyboardType="numeric"
                className="mb-6"
              />

              <View className="flex-row gap-3">
                <Button
                  onPress={editingFruit ? handleUpdateFruit : handleAddFruit}
                  className="flex-1"
                >
                  {THAI_TEXT.save}
                </Button>
                <Button
                  variant="outline"
                  onPress={resetForm}
                  className="flex-1"
                >
                  {THAI_TEXT.cancel}
                </Button>
              </View>
            </CardContent>
          </Card>
        )}

        <Text className="text-xl font-bold text-foreground mb-4">
          ผลไม้ของคุณ ({fruits.length} รายการ)
        </Text>

        {loading ? (
          <Text className="text-center text-muted-foreground">กำลังโหลด...</Text>
        ) : (
          <FlatList
            data={fruits}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderFruitItem}
            showsVerticalScrollIndicator={false}
          />
        )}

        <Button
          onPress={() => navigation.navigate('Camera')}
          className="mt-6"
          size="xl"
        >
          เริ่มใช้งาน →
        </Button>
      </View>
    </SafeAreaView>
  );
}