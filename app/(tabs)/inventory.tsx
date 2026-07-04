import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { localMedicines } from '@/services/repositories/localDb';
import { dummyPHCs } from '@/dummy/phcs';

export default function InventoryScreen() {
  const { authState } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All Items');

  const assignedFacilityId = authState?.facilityId || 'phc_barola';
  const facilityMedicines = localMedicines.filter(m => m.facilityId === assignedFacilityId);
  const phcName = dummyPHCs.find(p => p.id === assignedFacilityId)?.name || 'PHC Main Branch';

  const totalItems = facilityMedicines.length;
  const outOfStock = facilityMedicines.filter(m => m.currentStock === 0).length;
  const lowStockList = facilityMedicines.filter(m => m.currentStock <= m.minRequiredStock && m.currentStock > 0);
  const lowStock = lowStockList.length;
  const inStock = totalItems - outOfStock - lowStock;

  // Filter for rendering items
  const filteredMedicines = facilityMedicines.filter(m => {
    if (activeCategory === 'All Items') return true;
    if (activeCategory === 'Medicines' && ['TABLET', 'SYRUP', 'INJECTION', 'EMERGENCY'].includes(m.type)) return true;
    if (activeCategory === 'Vaccines' && m.type === 'VACCINE') return true;
    // For other categories, map roughly or show all for now since mock data types are limited
    return true;
  });

  const categories = [
    { id: 'all', name: 'All Items', icon: 'grid', color: '#3B82F6', bg: '#EFF6FF' },
    { id: 'medicines', name: 'Medicines', icon: 'pill', color: '#10B981', bg: '#ECFDF5' },
    { id: 'consumables', name: 'Consumables', icon: 'clipboard-text', color: '#F59E0B', bg: '#FFFBEB' },
    { id: 'equipment', name: 'Equipment', icon: 'monitor-pulse', color: '#8B5CF6', bg: '#F5F3FF' },
    { id: 'vaccines', name: 'Vaccines', icon: 'needle', color: '#14B8A6', bg: '#F0FDFA' },
    { id: 'other', name: 'Other', icon: 'dots-horizontal', color: '#64748B', bg: '#F8FAFC' },
  ];

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View className="px-4 pt-10 pb-2 flex-row justify-between items-start">
          <View className="flex-1 pr-4">
            <Text className="text-3xl font-black text-[#1E3A8A] tracking-tight">Inventory</Text>
            <Text className="text-slate-500 text-[13px] font-medium leading-tight mt-1">Manage medicines & supplies for your facility</Text>
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
              <Text className="text-2xl font-black text-slate-800">{totalItems}</Text>
              <Text className="text-slate-500 text-[10px] font-bold mb-4">Total Items</Text>
              <TouchableOpacity className="bg-blue-100/80 px-4 py-1.5 rounded-full border border-blue-200">
                <Text className="text-blue-600 font-bold text-[10px]">View all</Text>
              </TouchableOpacity>
            </View>

            {/* In Stock */}
            <View className="bg-[#F0FDF4] border border-emerald-100 rounded-2xl w-[115px] p-4 items-center relative shadow-sm shadow-emerald-100/50">
              <View className="w-12 h-12 rounded-full bg-emerald-500 items-center justify-center mb-3 shadow-md shadow-emerald-500/30">
                <MaterialCommunityIcons name="clipboard-check-outline" size={20} color="white" />
              </View>
              <Text className="text-2xl font-black text-slate-800">{inStock}</Text>
              <Text className="text-slate-500 text-[10px] font-bold mb-4">In Stock</Text>
              <View className="bg-emerald-100/80 px-3 py-1.5 rounded-full border border-emerald-200">
                <Text className="text-emerald-700 font-bold text-[10px]">Sufficient</Text>
              </View>
            </View>

            {/* Low Stock */}
            <View className="bg-[#FFFBEB] border border-orange-100 rounded-2xl w-[115px] p-4 items-center relative shadow-sm shadow-orange-100/50">
              <View className="w-12 h-12 rounded-full bg-orange-400 items-center justify-center mb-3 shadow-md shadow-orange-500/30">
                <Feather name="alert-triangle" size={20} color="white" />
              </View>
              <Text className="text-2xl font-black text-slate-800">{lowStock}</Text>
              <Text className="text-slate-500 text-[10px] font-bold mb-4">Low Stock</Text>
              <View className="bg-orange-100/80 px-3 py-1.5 rounded-full border border-orange-200">
                <Text className="text-orange-600 font-bold text-[10px]">Reorder Soon</Text>
              </View>
            </View>

            {/* Out of Stock */}
            <View className="bg-[#FEF2F2] border border-red-100 rounded-2xl w-[115px] p-4 items-center relative shadow-sm shadow-red-100/50">
              <View className="w-12 h-12 rounded-full bg-red-500 items-center justify-center mb-3 shadow-md shadow-red-500/30">
                <MaterialCommunityIcons name="cube-off-outline" size={22} color="white" />
              </View>
              <Text className="text-2xl font-black text-slate-800">{outOfStock}</Text>
              <Text className="text-slate-500 text-[10px] font-bold mb-4">Out of Stock</Text>
              <View className="bg-red-100/80 px-2 py-1.5 rounded-full border border-red-200">
                <Text className="text-red-700 font-bold text-[9px] tracking-tight">Need Attention</Text>
              </View>
            </View>

          </ScrollView>
        </View>

        {/* Search & Add Action */}
        <View className="px-4 mt-8 flex-row gap-3">
          <View className="flex-1 bg-white border border-slate-200 rounded-full flex-row items-center px-4 h-12 shadow-sm shadow-slate-100/50">
            <Feather name="search" size={18} color="#94A3B8" />
            <TextInput 
              placeholder="Search medicine or supplies..." 
              placeholderTextColor="#94A3B8"
              className="flex-1 ml-2 font-medium text-slate-700 text-[13px] h-full"
            />
          </View>
          <TouchableOpacity className="bg-[#1A63C6] rounded-full h-12 px-5 flex-row items-center justify-center shadow-md shadow-blue-500/30 active:bg-blue-800">
            <Feather name="plus" size={16} color="white" />
            <Text className="text-white font-extrabold text-[13px] ml-1.5">Add Item</Text>
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

        {/* Low Stock Alert Banner */}
        <View className="px-4 mt-6">
          <View className="bg-[#FEF2F2] border border-red-200 rounded-2xl p-4 flex-row items-center relative overflow-hidden shadow-sm shadow-red-100">
            <View className="w-11 h-11 rounded-lg bg-red-100/80 items-center justify-center mr-3 border border-red-200">
              <Feather name="trending-down" size={20} color="#EF4444" />
            </View>
            <View className="flex-1 pr-2">
              <Text className="text-[#991B1B] font-extrabold text-[14px] mb-0.5">Low Stock Alert</Text>
              <Text className="text-red-900/70 text-[11px] font-medium leading-relaxed">
                {lowStock + outOfStock} items are running low or out of stock. Reorder now to avoid stockouts.
              </Text>
            </View>
            <TouchableOpacity className="bg-white px-4 py-2 rounded-full border border-red-200 shadow-sm active:bg-slate-50">
              <Text className="text-red-600 font-bold text-[11px]">View All</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Items List */}
        <View className="px-4 mt-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-slate-800 font-extrabold text-[15px]">Recent Items</Text>
            <TouchableOpacity>
              <Text className="text-blue-600 font-bold text-[12px]">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-3xl border border-slate-100 p-2 shadow-sm shadow-slate-200/50">
            {filteredMedicines.map((item, idx) => {
              const isOOS = item.currentStock === 0;
              const isLow = item.currentStock <= item.minRequiredStock && item.currentStock > 0;
              
              const iconName = item.type === 'VACCINE' ? 'needle' : item.type === 'EMERGENCY' ? 'bottle-tonic-outline' : 'pill';
              const bgColor = isOOS ? 'bg-[#FEF2F2]' : isLow ? 'bg-[#FFFBEB]' : 'bg-[#EFF6FF]';
              const borderColor = isOOS ? 'border-red-50' : isLow ? 'border-orange-50' : 'border-blue-50';
              const iconColor = isOOS ? '#EF4444' : isLow ? '#F59E0B' : '#3B82F6';
              
              const statusBg = isOOS ? 'bg-red-50' : isLow ? 'bg-orange-50' : 'bg-emerald-50';
              const statusBorder = isOOS ? 'border-red-100' : isLow ? 'border-orange-100' : 'border-emerald-100';
              const statusTextCol = isOOS ? 'text-red-600' : isLow ? 'text-orange-600' : 'text-emerald-600';
              const statusText = isOOS ? 'Out of Stock' : isLow ? 'Low Stock' : 'Sufficient';
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
                    <Text className={`${stockTextCol} font-bold text-[9px] mt-0.5`}>In Stock</Text>
                  </View>
                  <View className={`${statusBg} border ${statusBorder} px-2 py-1 rounded-md mr-3`}>
                    <Text className={`${statusTextCol} font-bold text-[9px]`}>{statusText}</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color="#CBD5E1" />
                </View>
              );
            })}
          </View>
        </View>

      </ScrollView>

      {/* Floating Barcode Scanner Action Button */}
      <TouchableOpacity 
        className="absolute bottom-6 right-6 w-16 h-16 rounded-full bg-[#1A63C6] items-center justify-center shadow-lg shadow-blue-500/50 border-4 border-[#F8FAFC] active:bg-blue-800"
        style={{ elevation: 8 }}
      >
        <MaterialCommunityIcons name="barcode-scan" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
