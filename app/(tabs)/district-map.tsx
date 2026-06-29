import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '@/components/ui/layout/ScreenContainer';
import Badge from '@/components/ui/badges/Badge';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import OutlineButton from '@/components/ui/buttons/OutlineButton';
import BottomSheet from '@/components/ui/layout/BottomSheet';
import { dummyPHCs } from '@/dummy/phcs';
import { PHC } from '@/shared/types/phc';

export default function DistrictMapScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showHotspots] = useState(true);
  const [showVehicles] = useState(true);
  const [showTwinPreview, setShowTwinPreview] = useState(false);
  const [selectedPHC, setSelectedPHC] = useState<PHC | null>(null);

  // Filtered PHC markers
  const filteredPHCs = dummyPHCs.filter(phc =>
    phc.name.toLowerCase().includes(search.toLowerCase()) ||
    phc.block.toLowerCase().includes(search.toLowerCase())
  );

  // Mocked active cargo vehicle
  const cargoVehicle = {
    id: 'v1',
    item: 'Dengue NS1 Test Kits',
    qty: 50,
    from: 'Dharampur PHC',
    to: 'Rampur Kalan PHC',
    status: 'In Transit',
    progress: '65%',
  };

  const handleNavigateToPHC = (id: string) => {
    setSelectedPHC(null);
    router.push({
      pathname: '/phc-detail',
      params: { id }
    });
  };

  return (
    <ScreenContainer>
      {/* Search Bar & Overlay Controls */}
      <View className="absolute top-4 left-4 right-4 z-50 bg-slate-900/95 border border-slate-800 rounded-full px-5 py-3 flex-row items-center shadow-2xl">
        <Feather name="search" size={18} color="#64748B" className="mr-3" />
        <TextInput
          className="flex-1 text-white text-sm font-medium"
          placeholder="Search health centers, blocks..."
          placeholderTextColor="#64748B"
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <Pressable onPress={() => setSearch('')}>
            <Feather name="x" size={16} color="#94A3B8" />
          </Pressable>
        ) : null}
      </View>

      {/* Map Canvas Simulator */}
      <View className="flex-1 bg-slate-950 items-center justify-center relative overflow-hidden">
        {/* Mock Grid Lines representing map grid */}
        <View className="absolute inset-0 opacity-10 flex-col justify-between p-4">
          <View className="border-b border-blue-500 h-[1px] w-full" />
          <View className="border-b border-blue-500 h-[1px] w-full" />
          <View className="border-b border-blue-500 h-[1px] w-full" />
          <View className="border-b border-blue-500 h-[1px] w-full" />
        </View>
        <View className="absolute inset-0 opacity-10 flex-row justify-between p-4">
          <View className="border-r border-blue-500 w-[1px] h-full" />
          <View className="border-r border-blue-500 w-[1px] h-full" />
          <View className="border-r border-blue-500 w-[1px] h-full" />
          <View className="border-r border-blue-500 w-[1px] h-full" />
        </View>

        {/* Pulsing Hotspot Rings */}
        {showHotspots && (
          <View className="absolute top-[40%] left-[30%] w-40 h-40 rounded-full border border-red-500/30 bg-red-500/5 items-center justify-center">
            <View className="w-20 h-20 rounded-full border border-red-500/40 bg-red-500/10 items-center justify-center">
              <View className="w-4 h-4 rounded-full bg-red-500 animate-ping" />
            </View>
          </View>
        )}

        {/* Cargo Vehicle Simulator Indicator */}
        {showVehicles && (
          <View className="absolute top-[45%] left-[50%] bg-blue-600 border border-blue-400 rounded-full p-2.5 shadow-lg flex-row items-center">
            <Feather name="truck" size={12} color="white" />
            <Text className="text-white text-[9px] font-bold ml-1.5">Cargo V1 (65%)</Text>
          </View>
        )}

        {/* Dynamic PHC Pins */}
        {filteredPHCs.map((phc) => {
          // Absolute layout simulation of geographic positions
          let top = '30%';
          let left = '45%';
          if (phc.id === 'phc_dharampur') { top = '28%'; left = '20%'; }
          if (phc.id === 'phc_kalan') { top = '48%'; left = '70%'; }
          if (phc.id === 'phc_sewapur') { top = '65%'; left = '40%'; }
          if (phc.id === 'phc_kheri') { top = '75%'; left = '60%'; }

          const scoreColor = phc.healthScore > 80 
            ? 'bg-green-500 border-green-400' 
            : phc.healthScore > 60 
            ? 'bg-yellow-500 border-yellow-400' 
            : 'bg-red-500 border-red-400';

          return (
            <Pressable
              key={phc.id}
              onPress={() => setSelectedPHC(phc)}
              style={{ position: 'absolute', top, left } as any}
              className="items-center z-40"
            >
              <View className={`w-8 h-8 rounded-full border-2 ${scoreColor} items-center justify-center shadow-lg active:scale-110`}>
                <Feather name="heart" size={14} color="white" />
              </View>
              <View className="bg-slate-900/90 border border-slate-800 rounded px-1.5 py-0.5 mt-1">
                <Text className="text-white text-[8px] font-extrabold">{phc.name.split(' ')[0]}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Map Legend Overlay */}
      <View className="absolute bottom-6 left-6 bg-slate-900/95 border border-slate-800 rounded-3xl p-4 shadow-xl z-50">
        <Text className="text-white font-bold text-xs mb-2">Map Legend</Text>
        <View className="space-y-1.5">
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-full bg-green-505 bg-green-500 mr-2" />
            <Text className="text-slate-400 text-[10px] font-semibold">Health Score &gt; 80 (Adequate)</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-full bg-yellow-500 mr-2" />
            <Text className="text-slate-400 text-[10px] font-semibold">Health Score 60-80 (Warning)</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2" />
            <Text className="text-slate-400 text-[10px] font-semibold">Health Score &lt; 60 (Critical)</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3.5 h-0.5 border-t-2 border-dashed border-red-400 mr-1.5" />
            <Text className="text-slate-400 text-[10px] font-semibold ml-1">Disease Hotspot Zone</Text>
          </View>
        </View>
      </View>

      {/* Map Layers Toggles Overlay (Right Sidebar Control) */}
      <View className="absolute bottom-6 right-6 space-y-3 z-50">
        <Pressable
          onPress={() => setShowTwinPreview(prev => !prev)}
          className={`w-12 h-12 rounded-full items-center justify-center border shadow-xl ${
            showTwinPreview ? 'bg-blue-600 border-blue-400' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <Feather name="layers" size={20} color="white" />
        </Pressable>
      </View>

      {/* Twin Digital Twin Overlay Slide out */}
      {showTwinPreview && (
        <View className="absolute top-20 right-4 w-72 bg-slate-900/95 border border-slate-800 rounded-3xl p-5 shadow-2xl z-50">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white font-extrabold text-sm">District Digital Twin</Text>
            <Pressable onPress={() => setShowTwinPreview(false)}>
              <Feather name="x" size={16} color="#94A3B8" />
            </Pressable>
          </View>
          <Text className="text-slate-400 text-[10px] leading-relaxed mb-4">
            Real-time aggregate telemetry models of beds, doctors, and primary pharmaceutical stocks.
          </Text>
          <View className="space-y-3">
            <View>
              <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1">Dengue Kits</Text>
              <View className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <View className="h-full bg-yellow-500 w-[62%]" />
              </View>
              <Text className="text-slate-500 text-[9px] mt-1 text-right">310 / 500 Available</Text>
            </View>
            <View>
              <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1">Bed Occupancy</Text>
              <View className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <View className="h-full bg-blue-500 w-[82%]" />
              </View>
              <Text className="text-slate-500 text-[9px] mt-1 text-right">30 / 36 Occupied</Text>
            </View>
          </View>
        </View>
      )}

      {/* PHC Details Modal drawer (BottomSheet) */}
      <BottomSheet
        visible={!!selectedPHC}
        title={selectedPHC?.name || ''}
        onClose={() => setSelectedPHC(null)}
      >
        {selectedPHC && (
          <View className="p-2">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-slate-400 text-xs">{selectedPHC.block} Block</Text>
                <View className="flex-row items-center mt-1">
                  <Feather 
                    name={selectedPHC.doctorAvailable ? "check-circle" : "x-circle"} 
                    size={14} 
                    color={selectedPHC.doctorAvailable ? "#10B981" : "#EF4444"} 
                    className="mr-1.5"
                  />
                  <Text className="text-slate-300 text-xs font-semibold">
                    {selectedPHC.doctorAvailable ? 'Medical Officer Present' : 'Medical Officer Absent'}
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-slate-400 text-[10px] uppercase font-bold">Health Score</Text>
                <Text className={`text-2xl font-black ${
                  selectedPHC.healthScore > 80 ? 'text-green-400' : selectedPHC.healthScore > 60 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {selectedPHC.healthScore}%
                </Text>
              </View>
            </View>

            <View className="bg-slate-800/50 border border-slate-700/30 rounded-2xl p-4 mb-4">
              <View className="flex-row justify-between mb-2.5">
                <Text className="text-slate-400 text-xs">Available Beds</Text>
                <Text className="text-white font-bold text-xs">{selectedPHC.bedsTotal - selectedPHC.bedsOccupied} / {selectedPHC.bedsTotal}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-slate-400 text-xs">Stock Level Status</Text>
                <Badge label={selectedPHC.stockStatus.toUpperCase()} variant={selectedPHC.stockStatus === 'adequate' ? 'success' : selectedPHC.stockStatus === 'warning' ? 'warning' : 'critical'} />
              </View>
            </View>

            {/* Quick Actions inside Map Drawer */}
            <View className="flex-row space-x-3">
              <View className="flex-1">
                <PrimaryButton
                  title="Command Details"
                  onPress={() => handleNavigateToPHC(selectedPHC.id)}
                />
              </View>
              <View className="flex-1">
                <OutlineButton
                  title="Close Map View"
                  onPress={() => setSelectedPHC(null)}
                />
              </View>
            </View>
          </View>
        )}
      </BottomSheet>

      {/* Cargo Redistribution Overlay Modal */}
      {selectedPHC?.id === 'phc_kalan' && showVehicles && (
        <View className="absolute bottom-36 left-6 right-6 bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl z-50 flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 mr-4">
            <View className="w-10 h-10 rounded-full bg-blue-500/10 items-center justify-center mr-3 border border-blue-500/20">
              <Feather name="truck" size={18} color="#60A5FA" />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-white font-bold text-xs">Logistics Cargo V1</Text>
                <Text className="text-blue-400 text-[9px] font-extrabold ml-2 bg-blue-900/30 px-1.5 py-0.5 rounded">IN TRANSIT</Text>
              </View>
              <Text className="text-slate-400 text-[10px] mt-0.5 truncate">{cargoVehicle.qty} kits from Dharampur PHC</Text>
            </View>
          </View>
          <OutlineButton 
            title="Track Route" 
            onPress={() => router.push('/resource-movement-tracker')}
          />
        </View>
      )}
    </ScreenContainer>
  );
}
