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
  const [stockFilter, setStockFilter] = useState('ALL'); // 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
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
    setInventoryLoading(true);
    const unsubscribeInventory = phcRepository.subscribeInventory(assignedFacilityId, (inventory) => {
      setFacilityMedicines(inventory);
      setInventoryLoading(false);
    });

    const unsubscribePhc = phcRepository.subscribePHC(assignedFacilityId, (phc) => {
      if (phc) setPhcName(phc.name);
    });

    return () => {
      unsubscribeInventory();
      unsubscribePhc();
    };
  }, [assignedFacilityId]);

  const totalItems = facilityMedicines.length;
  const outOfStock = facilityMedicines.filter(m => m.currentStock === 0).length;
  const lowStockList = facilityMedicines.filter(m => m.currentStock <= m.minRequiredStock && m.currentStock > 0);
  const lowStock = lowStockList.length;
  const inStock = totalItems - outOfStock - lowStock;

  // We don't have all medicines universally since we moved to backend, so we only extract categories from what we have.
  const uniqueMedicines = Array.from(new Map(facilityMedicines.map(m => [m.name, m])).values());

  // Filter for rendering items
  const filteredMedicines = facilityMedicines.filter(m => {
    // 1. Stock filter
    if (stockFilter === 'OUT_OF_STOCK' && m.currentStock !== 0) return false;
    if (stockFilter === 'LOW_STOCK' && (m.currentStock > m.minRequiredStock || m.currentStock === 0)) return false;
    if (stockFilter === 'IN_STOCK' && (m.currentStock === 0 || m.currentStock <= m.minRequiredStock)) return false; // In Stock means sufficient

    // 2. Category filter
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

        {/* Top Summary Cards (2x2 Grid like Reports) */}
        <View className="mt-4 px-4 flex-row flex-wrap justify-between">
          
          {/* Total Items */}
          <TouchableOpacity onPress={() => setStockFilter('ALL')} className={`w-[48%] bg-[#DBEAFE] rounded-[16px] p-4 shadow-sm shadow-blue-500/10 mb-4 justify-between overflow-hidden ${stockFilter === 'ALL' ? 'border-[3px] border-[#3B82F6]' : 'border border-[#3B82F6]/60'}`} style={{ minHeight: 140 }} activeOpacity={0.7}>
            <Feather name="box" size={100} color="rgba(59,130,246,0.05)" style={{position: 'absolute', bottom: -20, right: -20, transform: [{rotate: '-15deg'}]}} />
            <View className="flex-row justify-between items-start">
              <View className="flex-1 mr-2">
                <Text className="text-slate-500 font-bold text-[12px] uppercase tracking-wider leading-tight">{t('inventoryTotalItems')}</Text>
              </View>
              <View className="w-9 h-9 rounded-full bg-blue-50 items-center justify-center">
                <Feather name="box" size={18} color="#3B82F6" />
              </View>
            </View>
            <View>
              {inventoryLoading ? <Skeleton width={40} height={30} className="mb-1 rounded" /> : <Text className="text-brand-navy font-black text-3xl tracking-tight">{totalItems}</Text>}
              <View className="flex-row items-center mt-1">
                <Text className="text-blue-600 font-bold text-[11px]">{t('inventoryViewAll')}</Text>
                <Feather name="chevron-right" size={12} color="#3B82F6" style={{ marginLeft: 2 }} />
              </View>
            </View>
          </TouchableOpacity>

          {/* In Stock */}
          <TouchableOpacity onPress={() => setStockFilter('IN_STOCK')} className={`w-[48%] bg-[#D1FAE5] rounded-[16px] p-4 shadow-sm shadow-emerald-500/10 mb-4 justify-between overflow-hidden ${stockFilter === 'IN_STOCK' ? 'border-[3px] border-[#10B981]' : 'border border-[#10B981]/60'}`} style={{ minHeight: 140 }} activeOpacity={0.7}>
            <Feather name="check-circle" size={100} color="rgba(16,185,129,0.05)" style={{position: 'absolute', bottom: -20, right: -20, transform: [{rotate: '-15deg'}]}} />
            <View className="flex-row justify-between items-start">
              <View className="flex-1 mr-2">
                <Text className="text-slate-500 font-bold text-[12px] uppercase tracking-wider leading-tight">{t('inventoryInStock')}</Text>
              </View>
              <View className="w-9 h-9 rounded-full bg-emerald-50 items-center justify-center">
                <Feather name="check-circle" size={18} color="#10B981" />
              </View>
            </View>
            <View>
              {inventoryLoading ? <Skeleton width={40} height={30} className="mb-1 rounded" /> : <Text className="text-brand-navy font-black text-3xl tracking-tight">{inStock}</Text>}
              <Text className="text-emerald-600 font-bold text-[11px] mt-1">{t('inventorySufficient')}</Text>
            </View>
          </TouchableOpacity>

          {/* Low Stock */}
          <TouchableOpacity onPress={() => setStockFilter('LOW_STOCK')} className={`w-[48%] bg-[#FEF3C7] rounded-[16px] p-4 shadow-sm shadow-amber-500/10 mb-4 justify-between overflow-hidden ${stockFilter === 'LOW_STOCK' ? 'border-[3px] border-[#F59E0B]' : 'border border-[#F59E0B]/60'}`} style={{ minHeight: 140 }} activeOpacity={0.7}>
            <Feather name="alert-triangle" size={100} color="rgba(245,158,11,0.05)" style={{position: 'absolute', bottom: -20, right: -20, transform: [{rotate: '-15deg'}]}} />
            <View className="flex-row justify-between items-start">
              <View className="flex-1 mr-2">
                <Text className="text-slate-500 font-bold text-[12px] uppercase tracking-wider leading-tight">{t('inventoryLowStock')}</Text>
              </View>
              <View className="w-9 h-9 rounded-full bg-amber-50 items-center justify-center">
                <Feather name="alert-triangle" size={18} color="#F59E0B" />
              </View>
            </View>
            <View>
              {inventoryLoading ? <Skeleton width={40} height={30} className="mb-1 rounded" /> : <Text className="text-brand-navy font-black text-3xl tracking-tight">{lowStock}</Text>}
              <Text className="text-amber-600 font-bold text-[11px] mt-1">{t('inventoryReorderSoon')}</Text>
            </View>
          </TouchableOpacity>

          {/* Out of Stock */}
          <TouchableOpacity onPress={() => setStockFilter('OUT_OF_STOCK')} className={`w-[48%] bg-[#FEE2E2] rounded-[16px] p-4 shadow-sm shadow-red-500/10 mb-4 justify-between overflow-hidden ${stockFilter === 'OUT_OF_STOCK' ? 'border-[3px] border-[#EF4444]' : 'border border-[#EF4444]/60'}`} style={{ minHeight: 140 }} activeOpacity={0.7}>
            <Feather name="x-octagon" size={100} color="rgba(239,68,68,0.05)" style={{position: 'absolute', bottom: -20, right: -20, transform: [{rotate: '-15deg'}]}} />
            <View className="flex-row justify-between items-start">
              <View className="flex-1 mr-2">
                <Text className="text-slate-500 font-bold text-[12px] uppercase tracking-wider leading-tight">{t('inventoryOutOfStock')}</Text>
              </View>
              <View className="w-9 h-9 rounded-full bg-red-50 items-center justify-center">
                <Feather name="x-octagon" size={18} color="#EF4444" />
              </View>
            </View>
            <View>
              {inventoryLoading ? <Skeleton width={40} height={30} className="mb-1 rounded" /> : <Text className="text-brand-navy font-black text-3xl tracking-tight">{outOfStock}</Text>}
              <Text className="text-red-600 font-bold text-[11px] mt-1 tracking-tight">{t('inventoryNeedAttention')}</Text>
            </View>
          </TouchableOpacity>

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
            <View className="px-2 mt-2">
              {filteredMedicines.map((item, idx) => {
                const isOOS = item.currentStock === 0;
                const isLow = item.currentStock <= item.minRequiredStock && item.currentStock > 0;
                
                const iconName = item.type === 'VACCINES' ? 'needle' : item.type === 'EMERGENCY' ? 'bottle-tonic-outline' : 'pill';
                
                // Style matching situation-room logistics
                const rowBgColor = isOOS ? 'bg-red-50' : isLow ? 'bg-orange-50' : 'bg-blue-50';
                const rowBorderColor = isOOS ? 'border-red-200' : isLow ? 'border-orange-200' : 'border-blue-200';
                const leftBarColor = isOOS ? 'bg-red-500' : isLow ? 'bg-[#F97316]' : 'bg-[#3B82F6]';
                
                const iconBgColor = isOOS ? '#FEE2E2' : isLow ? '#FFEDD5' : '#DBEAFE';
                const iconColor = isOOS ? '#EF4444' : isLow ? '#EA580C' : '#2563EB';
                const badgeIcon = isOOS ? 'alert-octagon' : isLow ? 'alert' : 'check-circle';
                
                const statusBg = isOOS ? 'bg-red-100' : isLow ? 'bg-orange-100' : 'bg-blue-100';
                const statusBorder = isOOS ? 'border-red-200' : isLow ? 'border-orange-200' : 'border-blue-200';
                const statusTextCol = isOOS ? 'text-red-700' : isLow ? 'text-orange-700' : 'text-blue-700';
                const statusText = isOOS ? t('inventoryOutOfStock') : isLow ? t('inventoryLowStock') : t('inventorySufficient');

                // Stock Box styling
                const stockBoxBg = isOOS ? 'bg-red-500' : isLow ? 'bg-orange-500' : 'bg-blue-500';
                const stockBoxBorder = isOOS ? 'border-red-400' : isLow ? 'border-orange-400' : 'border-blue-400';

                return (
                  <View key={item.id} className={`${rowBgColor} rounded-[12px] mb-3 shadow-sm shadow-slate-200/50 border ${rowBorderColor} flex-row overflow-hidden p-2.5 items-center relative`}>
                    {/* Left Colored Bar */}
                    <View className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full ${leftBarColor}`} />
                    
                    {/* Square Icon Container */}
                    <View className="ml-2 w-[40px] h-[40px] rounded-[10px] items-center justify-center mr-3 relative" style={{ backgroundColor: iconBgColor }}>
                      <MaterialCommunityIcons name={iconName} size={20} color={iconColor} />
                      <View className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px] shadow-sm border border-slate-100">
                        <MaterialCommunityIcons name={badgeIcon} size={10} color={iconColor} />
                      </View>
                    </View>
                    
                    {/* Middle Info */}
                    <View className="flex-1 pr-2">
                      <Text className="text-[#1E3A8A] font-black text-[14px] tracking-tight mb-0.5" numberOfLines={1}>{item.name}</Text>
                      <Text className="text-slate-500 font-semibold text-[9px] uppercase tracking-wider">{item.type}</Text>
                    </View>
                    
                    {/* Right Info */}
                    <View className="flex-row items-center">
                      <View className={`${stockBoxBg} ${stockBoxBorder} border rounded-[14px] w-[50px] py-1.5 items-center justify-center mr-2 shadow-sm shadow-black/10`}>
                        <Text className="text-white font-black text-[18px] leading-tight">{item.currentStock}</Text>
                        <Text className="text-white/90 font-bold text-[8px] uppercase tracking-wider mt-0.5" numberOfLines={1}>{item.unit || t('inventoryDefaultUnit')}</Text>
                      </View>
                      
                      <View className={`${statusBg} border ${statusBorder} px-2 py-1 rounded-full`}>
                        <Text className={`${statusTextCol} font-bold text-[8px] uppercase tracking-wider`}>{statusText}</Text>
                      </View>
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
