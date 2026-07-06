import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { phcRepository } from '@/services/repositories/phcRepository';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Skeleton from '@/components/ui/feedback/Skeleton';
import { MedicineStock } from '@/shared/types/medicine';
import geminiService from '@/services/ai/geminiService';
import { useTranslation } from '@/hooks/useTranslation';

export default function InventoryScreen() {
  const { authState } = useAuth();
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState(t('inventoryCategoryAllItems'));
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal State
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [showMedicineDropdown, setShowMedicineDropdown] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const cameraRef = useRef<any>(null);

  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState('ANTIBIOTICS');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [newItemStock, setNewItemStock] = useState('');

  const assignedFacilityId = authState?.facilityId || 'phc_barola';
  const [facilityMedicines, setFacilityMedicines] = useState<MedicineStock[]>([]);
  const [phcName, setPhcName] = useState(t('inventoryDefaultPhcName'));
  const [inventoryLoading, setInventoryLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const inventory = await phcRepository.getInventory(assignedFacilityId);
        setFacilityMedicines(inventory);
        
        const phc = await phcRepository.getPHC(assignedFacilityId);
        if (phc) {
          setPhcName(phc.name);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setInventoryLoading(false);
      }
    };
    fetchInventory();
  }, [assignedFacilityId, refreshKey]);

  const totalItems = facilityMedicines.length;
  const outOfStock = facilityMedicines.filter(m => m.currentStock === 0).length;
  const lowStockList = facilityMedicines.filter(m => m.currentStock <= m.minRequiredStock && m.currentStock > 0);
  const lowStock = lowStockList.length;
  const inStock = totalItems - outOfStock - lowStock;

  // We don't have all medicines universally since we moved to backend, so we only extract categories from what we have.
  const uniqueMedicines = Array.from(new Map(facilityMedicines.map(m => [m.name, m])).values());

  // Filter for rendering items
  const filteredMedicines = facilityMedicines.filter(m => {
    if (activeCategory === t('inventoryCategoryAllItems')) return true;
    if (activeCategory === t('inventoryCategoryMedicines')) return ['ANTIBIOTICS', 'ANALGESICS', 'ANTIVIRALS', 'CHRONIC_CARE', 'EMERGENCY'].includes(m.type);
    if (activeCategory === t('inventoryCategoryConsumables')) return m.type === 'CONSUMABLES' || m.type === 'IV_FLUIDS';
    if (activeCategory === t('inventoryCategoryEquipment')) return m.type === 'EQUIPMENT'; 
    if (activeCategory === t('inventoryCategoryVaccines')) return m.type === 'VACCINES';
    return false;
  });

  const categories = [
    { id: 'all', name: t('inventoryCategoryAllItems'), icon: 'grid', color: '#3B82F6', bg: '#EFF6FF' },
    { id: 'medicines', name: t('inventoryCategoryMedicines'), icon: 'pill', color: '#10B981', bg: '#ECFDF5' },
    { id: 'consumables', name: t('inventoryCategoryConsumables'), icon: 'clipboard-text', color: '#F59E0B', bg: '#FFFBEB' },
    { id: 'equipment', name: t('inventoryCategoryEquipment'), icon: 'heart-pulse', color: '#8B5CF6', bg: '#F5F3FF' },
    { id: 'vaccines', name: t('inventoryCategoryVaccines'), icon: 'needle', color: '#14B8A6', bg: '#F0FDFA' }
  ];

  const handleAddItem = () => {
    if (!newItemName || !newItemStock) {
      Alert.alert(t('inventoryAlertErrorTitle'), t('inventoryAlertErrorMsg'));
      return;
    }
    const newItem = {
      id: `item_${Date.now()}`,
      name: newItemName,
      type: newItemType as any,
      currentStock: parseInt(newItemStock, 10) || 0,
      minRequiredStock: 50, // default
      unit: newItemUnit || t('inventoryDefaultUnit'),
      lastUpdated: new Date().toISOString(),
      facilityId: assignedFacilityId
    };
    phcRepository.addMedicine(newItem as any).then(() => {
      setRefreshKey(prev => prev + 1);
      setIsAddModalVisible(false);
      setNewItemName('');
      setNewItemStock('');
      setNewItemUnit('');
      setNewItemType('ANTIBIOTICS');
    });
  };

  const handleScanMedicine = async () => {
    if (!cameraPermission?.granted) {
      const perm = await requestCameraPermission();
      if (!perm.granted) {
        alert(t('inventoryCameraPermissionAlert'));
        return;
      }
    }
    setIsCameraVisible(true);
  };

  const handleTakePicture = async () => {
    if (!cameraRef.current) return;
    try {
      setIsProcessingImage(true);
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
      setIsCameraVisible(false); // hide camera immediately

      if (photo.base64) {
        const extracted = await geminiService.extractMedicineFromImage(photo.base64);
        if (extracted) {
          setNewItemName(extracted.name);
          setNewItemType(extracted.category);
          setNewItemStock(extracted.quantity);
          setNewItemUnit(extracted.unit);
        } else {
          alert(t('inventoryExtractFailAlert'));
        }
      }
    } catch (e) {
      console.error(e);
      alert(t('inventoryImageProcessFailAlert'));
    } finally {
      setIsProcessingImage(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View className="px-4 pt-10 pb-2 flex-row justify-between items-start">
          <View className="flex-1 pr-4">
            <Text className="text-3xl font-black text-[#1E3A8A] tracking-tight">{t('inventoryTitle')}</Text>
            <Text className="text-slate-500 text-[13px] font-medium leading-tight mt-1">{t('inventorySubtitle')}</Text>
          </View>
          <TouchableOpacity className="bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm flex-row items-center active:opacity-60">
            <MaterialCommunityIcons name="hospital-building" size={16} color="#3B82F6" />
            <Text className="text-slate-700 font-bold text-[11px] mx-1.5">{phcName}</Text>
            <Feather name="chevron-down" size={14} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Top Summary Cards (Horizontal Scroll) */}
        <View className="mt-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
            
            {/* Total Items */}
            <View className="bg-[#EFF6FF] border border-blue-100 rounded-2xl w-[115px] p-4 items-center relative shadow-sm shadow-blue-100/50">
              <View className="w-12 h-12 rounded-full bg-blue-600 items-center justify-center mb-3 shadow-md shadow-blue-500/30">
                <Feather name="box" size={20} color="white" />
              </View>
              {inventoryLoading ? <Skeleton width={40} height={30} className="mb-1 rounded" /> : <Text className="text-2xl font-black text-slate-800">{totalItems}</Text>}
              <Text className="text-slate-500 text-[10px] font-bold mb-4">{t('inventoryTotalItems')}</Text>
              <TouchableOpacity className="bg-blue-100/80 px-4 py-1.5 rounded-full border border-blue-200">
                <Text className="text-blue-600 font-bold text-[10px]">{t('inventoryViewAll')}</Text>
              </TouchableOpacity>
            </View>

            {/* In Stock */}
            <View className="bg-[#ECFDF5] border border-emerald-100 rounded-2xl w-[115px] p-4 items-center relative shadow-sm shadow-emerald-100/50">
              <View className="w-12 h-12 rounded-full bg-emerald-500 items-center justify-center mb-3 shadow-md shadow-emerald-500/30">
                <Feather name="check-circle" size={20} color="white" />
              </View>
              {inventoryLoading ? <Skeleton width={40} height={30} className="mb-1 rounded" /> : <Text className="text-2xl font-black text-slate-800">{inStock}</Text>}
              <Text className="text-slate-500 text-[10px] font-bold mb-4">{t('inventoryInStock')}</Text>
              <View className="bg-emerald-100/80 px-3 py-1.5 rounded-full border border-emerald-200">
                <Text className="text-emerald-700 font-bold text-[10px]">{t('inventorySufficient')}</Text>
              </View>
            </View>

            {/* Low Stock */}
            <View className="bg-[#FFFBEB] border border-amber-100 rounded-2xl w-[115px] p-4 items-center relative shadow-sm shadow-amber-100/50">
              <View className="w-12 h-12 rounded-full bg-amber-500 items-center justify-center mb-3 shadow-md shadow-amber-500/30">
                <Feather name="alert-triangle" size={20} color="white" />
              </View>
              {inventoryLoading ? <Skeleton width={40} height={30} className="mb-1 rounded" /> : <Text className="text-2xl font-black text-slate-800">{lowStock}</Text>}
              <Text className="text-slate-500 text-[10px] font-bold mb-4">{t('inventoryLowStock')}</Text>
              <View className="bg-orange-100/80 px-3 py-1.5 rounded-full border border-orange-200">
                <Text className="text-orange-600 font-bold text-[10px]">{t('inventoryReorderSoon')}</Text>
              </View>
            </View>

            {/* Out of Stock */}
            <View className="bg-[#FEF2F2] border border-red-100 rounded-2xl w-[115px] p-4 items-center relative shadow-sm shadow-red-100/50">
              <View className="w-12 h-12 rounded-full bg-red-500 items-center justify-center mb-3 shadow-md shadow-red-500/30">
                <Feather name="x-octagon" size={20} color="white" />
              </View>
              {inventoryLoading ? <Skeleton width={40} height={30} className="mb-1 rounded" /> : <Text className="text-2xl font-black text-slate-800">{outOfStock}</Text>}
              <Text className="text-slate-500 text-[10px] font-bold mb-4">{t('inventoryOutOfStock')}</Text>
              <View className="bg-red-100/80 px-2 py-1.5 rounded-full border border-red-200">
                <Text className="text-red-700 font-bold text-[9px] tracking-tight">{t('inventoryNeedAttention')}</Text>
              </View>
            </View>

          </ScrollView>
        </View>

        <View className="px-4 mt-8 flex-row gap-3">
          <View className="flex-1 bg-white border border-slate-200 rounded-full flex-row items-center px-4 h-12 shadow-sm shadow-slate-100/50">
            <Feather name="search" size={18} color="#94A3B8" />
            <TextInput 
              placeholder={t('inventorySearchPlaceholder')}
              placeholderTextColor="#94A3B8"
              className="flex-1 ml-2 font-medium text-slate-700 text-[13px] h-full"
            />
          </View>
          <TouchableOpacity onPress={() => setIsAddModalVisible(true)} className="bg-[#1A63C6] rounded-full h-12 px-5 flex-row items-center justify-center shadow-md shadow-blue-500/30 active:bg-blue-800">
            <Feather name="plus" size={16} color="white" />
            <Text className="text-white font-extrabold text-[13px] ml-1.5">{t('inventoryAddItem')}</Text>
          </TouchableOpacity>
        </View>

        {/* Categories Horizontal Scroll */}
        <View className="mt-8">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 24 }}>
            {categories.map((cat) => {
              const isActive = activeCategory === cat.name;
              return (
                <TouchableOpacity 
                  key={cat.id} 
                  onPress={() => setActiveCategory(cat.name)}
                  className={`items-center justify-center relative pb-3 ${isActive ? '' : 'opacity-80'}`}
                >
                  <View className="w-[50px] h-[50px] rounded-full items-center justify-center mb-2 shadow-sm border border-white" style={{ backgroundColor: cat.bg }}>
                    <MaterialCommunityIcons name={cat.icon as any} size={24} color={cat.color} />
                  </View>
                  <Text className={`text-[11px] font-bold ${isActive ? 'text-[#1A63C6]' : 'text-slate-700'}`}>{cat.name}</Text>
                  
                  {/* Active Indicator Underline */}
                  {isActive && (
                    <View className="absolute bottom-0 w-8 h-1 bg-[#1A63C6] rounded-t-md" />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Recent Items List */}
        <View className="px-4 mt-8">


          {filteredMedicines.length > 0 ? (
            <View className="bg-white rounded-3xl border border-slate-100 p-2 shadow-sm shadow-slate-200/50">
              {filteredMedicines.map((item, idx) => {
                const isOOS = item.currentStock === 0;
                const isLow = item.currentStock <= item.minRequiredStock && item.currentStock > 0;
                
                const iconName = item.type === 'VACCINES' ? 'needle' : item.type === 'EMERGENCY' ? 'bottle-tonic-outline' : 'pill';
                const bgColor = isOOS ? 'bg-[#FEF2F2]' : isLow ? 'bg-[#FFFBEB]' : 'bg-[#EFF6FF]';
                const borderColor = isOOS ? 'border-red-50' : isLow ? 'border-orange-50' : 'border-blue-50';
                const iconColor = isOOS ? '#EF4444' : isLow ? '#F59E0B' : '#3B82F6';
                
                const statusBg = isOOS ? 'bg-red-50' : isLow ? 'bg-orange-50' : 'bg-emerald-50';
                const statusBorder = isOOS ? 'border-red-100' : isLow ? 'border-orange-100' : 'border-emerald-100';
                const statusTextCol = isOOS ? 'text-red-600' : isLow ? 'text-orange-600' : 'text-emerald-600';
                const statusText = isOOS ? t('inventoryOutOfStock') : isLow ? t('inventoryLowStock') : t('inventorySufficient');
                const stockTextCol = isOOS ? 'text-red-500' : isLow ? 'text-orange-500' : 'text-emerald-500';

                return (
                  <View key={item.id} className={`flex-row items-center py-3 px-2 ${idx !== filteredMedicines.length - 1 ? 'border-b border-slate-50' : ''}`}>
                    <View className={`w-[46px] h-[46px] rounded-[14px] ${bgColor} items-center justify-center mr-3 border ${borderColor}`}>
                      <MaterialCommunityIcons name={iconName} size={22} color={iconColor} />
                    </View>
                    <View className="flex-1 pr-2">
                      <Text className="text-slate-800 font-extrabold text-[14px] mb-0.5" numberOfLines={1}>{item.name}</Text>
                      <Text className="text-slate-400 font-semibold text-[11px]">{item.type}</Text>
                    </View>
                    <View className="items-center mr-4 w-[50px]">
                      <Text className="text-slate-800 font-black text-[14px]">{item.currentStock}</Text>
                      <Text className={`${stockTextCol} font-bold text-[9px] mt-0.5`}>{item.unit || t('inventoryDefaultUnit')}</Text>
                    </View>
                    <View className={`${statusBg} border ${statusBorder} px-2 py-1 rounded-md mr-3`}>
                      <Text className={`${statusTextCol} font-bold text-[9px]`}>{statusText}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
             <View className="bg-slate-50 border border-slate-100 rounded-3xl p-8 items-center justify-center mt-2">
               <MaterialCommunityIcons name="clipboard-text-off-outline" size={32} color="#94A3B8" />
               <Text className="text-slate-600 font-bold mt-3">{t('inventoryNoItemsFound')}</Text>
               <Text className="text-slate-400 text-[11px] text-center mt-1">{t('inventoryNoItemsDesc')}</Text>
             </View>
          )}
        </View>

      </ScrollView>



      {/* Add Item Modal */}
      <Modal visible={isAddModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsAddModalVisible(false)}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[32px] p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-black text-slate-800">{t('inventoryAddNewItemTitle')}</Text>
              <TouchableOpacity onPress={() => setIsAddModalVisible(false)} className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center">
                <Feather name="x" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            {isProcessingImage && (
              <View className="bg-blue-50 p-4 rounded-xl mb-4 flex-row items-center">
                <ActivityIndicator size="small" color="#2563EB" className="mr-3" />
                <Text className="text-blue-700 font-bold text-[12px]">{t('inventoryAiExtracting')}</Text>
              </View>
            )}

            <View className="relative z-50">
              <Text className="text-slate-600 font-bold text-[11px] uppercase tracking-wider mb-2 ml-1">{t('inventoryItemNameLabel')}</Text>
              <TouchableOpacity 
                className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 mb-5 shadow-sm shadow-slate-100 flex-row justify-between items-center"
                onPress={() => setShowMedicineDropdown(!showMedicineDropdown)}
              >
                <Text className={newItemName ? "text-slate-800 font-semibold" : "text-slate-400 font-semibold"}>
                  {newItemName || t('inventoryItemNamePlaceholder')}
                </Text>
                <Feather name={showMedicineDropdown ? "chevron-up" : "chevron-down"} size={18} color="#64748B" />
              </TouchableOpacity>

              {showMedicineDropdown && (
                <View className="absolute top-[80px] left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-lg shadow-slate-200/50 max-h-48 z-50 overflow-hidden">
                  <ScrollView nestedScrollEnabled={true}>
                    {uniqueMedicines.map((med, idx) => (
                      <TouchableOpacity 
                        key={med.id} 
                        className={`px-4 py-3 ${idx !== uniqueMedicines.length - 1 ? 'border-b border-slate-100' : ''}`}
                        onPress={() => {
                          setNewItemName(med.name);
                          setNewItemType(med.type);
                          setNewItemUnit(med.unit);
                          setShowMedicineDropdown(false);
                        }}
                      >
                        <Text className="text-slate-800 font-bold">{med.name}</Text>
                        <Text className="text-slate-500 text-[10px]">{med.type} • {med.unit}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <Text className="text-slate-600 font-bold text-[11px] uppercase tracking-wider mb-2 ml-1">{t('inventoryCategoryTypeLabel')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5 flex-row">
              {['ANTIBIOTICS', 'ANALGESICS', 'ANTIVIRALS', 'VACCINES', 'IV_FLUIDS', 'EMERGENCY', 'CONSUMABLES', 'EQUIPMENT'].map((type) => (
                <TouchableOpacity 
                  key={type}
                  onPress={() => setNewItemType(type)}
                  className={`px-4 py-2.5 rounded-xl mr-3 border ${newItemType === type ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}
                >
                  <Text className={`${newItemType === type ? 'text-blue-700 font-bold' : 'text-slate-500 font-semibold'}`}>{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className="flex-row gap-4 mb-8">
              <View className="flex-1">
                <Text className="text-slate-600 font-bold text-[11px] uppercase tracking-wider mb-2 ml-1">{t('inventoryQuantityLabel')}</Text>
                <TextInput 
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-slate-800 font-semibold shadow-sm shadow-slate-100"
                  placeholder={t('inventoryQuantityPlaceholder')}
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={newItemStock}
                  onChangeText={setNewItemStock}
                />
              </View>
              <View className="flex-1">
                <Text className="text-slate-600 font-bold text-[11px] uppercase tracking-wider mb-2 ml-1">{t('inventoryUnitLabel')}</Text>
                <View className="bg-slate-100 border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-100 items-start justify-center">
                  <Text className={newItemUnit ? "text-slate-800 font-semibold" : "text-slate-400 font-semibold"}>
                    {newItemUnit || "Auto-filled"}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleAddItem}
              className="py-4 rounded-full bg-[#1A63C6] items-center justify-center shadow-lg shadow-blue-500/30"
            >
              <Text className="text-white font-black text-sm tracking-wide">{t('inventorySaveItem')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Camera View Modal */}
      {isCameraVisible && (
        <Modal visible={isCameraVisible} animationType="slide" transparent={false}>
          <View className="flex-1 bg-black">
            <CameraView 
              style={{ flex: 1 }} 
              facing="back"
              ref={cameraRef}
            >
              <View className="flex-1 justify-between p-6">
                <View className="flex-row justify-end mt-10">
                  <TouchableOpacity onPress={() => setIsCameraVisible(false)} className="w-10 h-10 rounded-full bg-black/50 items-center justify-center">
                    <Feather name="x" size={20} color="white" />
                  </TouchableOpacity>
                </View>
                
                <View className="items-center mb-10">
                  <Text className="text-white font-bold text-[14px] mb-6 text-center">{t('inventoryCameraGuideText')}</Text>
                  <TouchableOpacity 
                    onPress={handleTakePicture}
                    className="w-16 h-16 rounded-full bg-white items-center justify-center border-4 border-slate-300"
                  >
                    <Feather name="camera" size={24} color="#0F172A" />
                  </TouchableOpacity>
                </View>
              </View>
            </CameraView>
          </View>
        </Modal>
      )}

    </View>
  );
}
