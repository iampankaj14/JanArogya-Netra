import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { useInventory } from '../../../hooks/useInventory';
import dummyAlerts from '../../../dummy/alerts';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function PHCHomeDashboard() {
  const { authState } = useAuth();
  const router = useRouter();

  const facilityId = authState?.facilityId || 'phc_barola';
  const { stocks } = useInventory(facilityId);
  const lowStockCount = stocks.filter((s) => s.currentStock < s.minRequiredStock).length;
  
  const activeOutbreak = dummyAlerts.find(a => a.facilityId === facilityId && a.type === 'OUTBREAK' && !a.resolved);

  const facilityNames: Record<string, string> = {
    'phc_barola': 'PHC Barola',
    'phc_badalpur': 'PHC Badalpur',
    'phc_mandi_shyam_nagar': 'PHC Mandi Shyam Nagar',
  };
  const facilityName = facilityNames[facilityId] || 'PHC Barola';

  return (
    <ScrollView className="flex-1 bg-[#F8FAFC]" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

      {/* Header & Weather */}
      <View className="px-4 mt-6 flex-row justify-between items-start">
        <View className="flex-1 pr-2">
          <Text className="text-3xl font-black text-[#1E3A8A] tracking-tight">Welcome, Staff 👋</Text>
          <Text className="text-slate-500 text-[13px] font-semibold mt-1">{facilityName} • Today, 20 May 2025</Text>
        </View>
        <View className="bg-white rounded-[20px] p-3 shadow-sm border border-slate-100 flex-row items-center w-36">
          <MaterialCommunityIcons name="weather-partly-cloudy" size={28} color="#FBBF24" />
          <View className="ml-2">
            <View className="flex-row items-baseline">
              <Text className="text-lg font-black text-slate-800">32°C</Text>
            </View>
            <Text className="text-[9px] font-bold text-slate-500">Partly Cloudy</Text>
            <Text className="text-[9px] font-bold text-slate-400 mt-0.5"><Feather name="droplet" size={8} color="#3B82F6" /> 62%</Text>
          </View>
        </View>
      </View>

      {/* 4 Key Metrics Cards (Horizontal Scroll) */}
      <View className="mt-6">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>

          {/* Today's OPD */}
          <View className="bg-white rounded-[24px] border border-blue-100 shadow-sm w-[160px] p-4 relative overflow-hidden">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-2 border border-blue-100/50">
                <Feather name="users" size={14} color="#3B82F6" />
              </View>
              <Text className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">Today's OPD</Text>
            </View>
            <Text className="text-4xl font-black text-[#1E3A8A]">142</Text>
            <Text className="text-[11px] font-semibold text-slate-500 mb-4">Patients Served</Text>
            <View className="flex-row items-center mt-auto border-t border-slate-50 pt-3">
              <Feather name="trending-up" size={12} color="#10B981" />
              <Text className="text-[10px] font-bold text-emerald-500 mx-1">+12%</Text>
              <Text className="text-[10px] text-slate-400 font-semibold">vs yesterday</Text>
            </View>
          </View>

          {/* Low Stock Items */}
          <View className="bg-white rounded-[24px] border border-red-100 shadow-sm w-[160px] p-4 relative overflow-hidden">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 rounded-full bg-red-50 items-center justify-center mr-2 border border-red-100/50">
                <MaterialCommunityIcons name="pill" size={14} color="#EF4444" />
              </View>
              <Text className="text-[10px] font-bold text-red-500 tracking-widest uppercase">Low Stock Items</Text>
            </View>
            <Text className="text-4xl font-black text-[#1E3A8A]">{lowStockCount}</Text>
            <Text className="text-[11px] font-semibold text-slate-500 mb-4">Need Attention</Text>
            <TouchableOpacity className="flex-row items-center justify-between mt-auto border-t border-slate-50 pt-3 active:opacity-60" onPress={() => router.push('/(tabs)/inventory')}>
              <Text className="text-[11px] font-bold text-red-500">View Stock</Text>
              <Feather name="chevron-right" size={14} color="#EF4444" />
            </TouchableOpacity>
          </View>

          {/* IPD Occupancy */}
          <View className="bg-white rounded-[24px] border border-emerald-100 shadow-sm w-[160px] p-4 relative overflow-hidden">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 rounded-full bg-emerald-50 items-center justify-center mr-2 border border-emerald-100/50">
                <MaterialCommunityIcons name="bed-outline" size={14} color="#10B981" />
              </View>
              <Text className="text-[10px] font-bold text-emerald-500 tracking-widest uppercase">IPD Occupancy</Text>
            </View>
            <Text className="text-4xl font-black text-[#1E3A8A]">68%</Text>
            <Text className="text-[11px] font-semibold text-slate-500 mb-4">12 / 18 Beds Occupied</Text>
            <TouchableOpacity className="flex-row items-center justify-between mt-auto border-t border-slate-50 pt-3 active:opacity-60">
              <Text className="text-[11px] font-bold text-emerald-500">View Details</Text>
              <Feather name="chevron-right" size={14} color="#10B981" />
            </TouchableOpacity>
          </View>

          {/* Pending Tests */}
          <View className="bg-white rounded-[24px] border border-purple-100 shadow-sm w-[160px] p-4 relative overflow-hidden">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 rounded-full bg-purple-50 items-center justify-center mr-2 border border-purple-100/50">
                <MaterialCommunityIcons name="flask-outline" size={14} color="#8B5CF6" />
              </View>
              <Text className="text-[10px] font-bold text-purple-500 tracking-widest uppercase">Pending Tests</Text>
            </View>
            <Text className="text-4xl font-black text-[#1E3A8A]">24</Text>
            <Text className="text-[11px] font-semibold text-slate-500 mb-4">Awaiting Results</Text>
            <TouchableOpacity className="flex-row items-center justify-between mt-auto border-t border-slate-50 pt-3 active:opacity-60">
              <Text className="text-[11px] font-bold text-purple-500">View All</Text>
              <Feather name="chevron-right" size={14} color="#8B5CF6" />
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>

      {/* High Alert Banner */}
      {activeOutbreak && (
        <View className="px-4 mt-6">
          <View className="bg-[#FFF5F5] border border-red-200 rounded-[20px] p-4 flex-row items-center relative overflow-hidden shadow-sm shadow-red-100">
            <View className="w-12 h-12 rounded-full bg-red-100/80 items-center justify-center mr-3 border border-red-200">
              <MaterialCommunityIcons name="virus" size={24} color="#EF4444" />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <Text className="text-[#991B1B] font-extrabold text-[15px] mr-2">{activeOutbreak.title}</Text>
                <View className="bg-red-200/60 px-2 py-0.5 rounded-full border border-red-300">
                  <Text className="text-red-700 font-bold text-[8px] tracking-wider uppercase">High Alert</Text>
                </View>
              </View>
              <Text className="text-red-900/80 text-[11px] font-medium leading-relaxed pr-8">
                {activeOutbreak.description}
              </Text>
            </View>
            <TouchableOpacity className="absolute right-4 top-4 bg-white px-2 py-1.5 rounded-full border border-red-200 flex-row items-center shadow-sm active:bg-slate-50">
              <Text className="text-red-600 font-bold text-[9px] mr-0.5">View</Text>
              <Feather name="chevron-right" size={10} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Today's Summary */}
      <View className="mt-8">
        <View className="px-4 flex-row justify-between items-center mb-4">
          <Text className="text-slate-500 font-extrabold text-[12px] tracking-widest uppercase">Today's Summary</Text>
          <TouchableOpacity className="flex-row items-center">
            <Feather name="pie-chart" size={12} color="#3B82F6" />
            <Text className="text-blue-600 font-bold text-[12px] ml-1 mr-0.5">View Full Dashboard</Text>
            <Feather name="chevron-right" size={14} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>

          <View className="bg-white border border-slate-100 rounded-2xl py-3 px-4 flex-row items-center shadow-sm shadow-slate-200/50">
            <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-3">
              <Feather name="user-plus" size={14} color="#3B82F6" />
            </View>
            <View>
              <Text className="text-[#1E3A8A] font-black text-lg">82</Text>
              <Text className="text-slate-500 text-[10px] font-semibold mb-0.5">New Patients</Text>
              <Text className="text-emerald-500 text-[10px] font-bold">+8%</Text>
            </View>
          </View>

          <View className="bg-white border border-slate-100 rounded-2xl py-3 px-4 flex-row items-center shadow-sm shadow-slate-200/50">
            <View className="w-8 h-8 rounded-full bg-emerald-50 items-center justify-center mr-3">
              <MaterialCommunityIcons name="hospital-building" size={14} color="#10B981" />
            </View>
            <View>
              <Text className="text-[#1E3A8A] font-black text-lg">5</Text>
              <Text className="text-slate-500 text-[10px] font-semibold mb-0.5">Referrals</Text>
              <Text className="text-emerald-500 text-[10px] font-bold">+1</Text>
            </View>
          </View>

          <View className="bg-white border border-slate-100 rounded-2xl py-3 px-4 flex-row items-center shadow-sm shadow-slate-200/50">
            <View className="w-8 h-8 rounded-full bg-orange-50 items-center justify-center mr-3">
              <Feather name="user-check" size={14} color="#F97316" />
            </View>
            <View>
              <Text className="text-[#1E3A8A] font-black text-lg">18</Text>
              <Text className="text-slate-500 text-[10px] font-semibold mb-0.5">Lab Tests</Text>
              <Text className="text-emerald-500 text-[10px] font-bold">+3</Text>
            </View>
          </View>

          <View className="bg-white border border-slate-100 rounded-2xl py-3 px-4 flex-row items-center shadow-sm shadow-slate-200/50">
            <View className="w-8 h-8 rounded-full bg-purple-50 items-center justify-center mr-3">
              <Feather name="users" size={14} color="#8B5CF6" />
            </View>
            <View>
              <Text className="text-[#1E3A8A] font-black text-lg">3</Text>
              <Text className="text-slate-500 text-[10px] font-semibold mb-0.5">Follow Ups</Text>
              <Text className="text-slate-400 text-[10px] font-bold">+0</Text>
            </View>
          </View>

          <View className="bg-white border border-slate-100 rounded-2xl py-3 px-4 flex-row items-center shadow-sm shadow-slate-200/50">
            <View className="w-8 h-8 rounded-full bg-teal-50 items-center justify-center mr-3">
              <MaterialCommunityIcons name="bed-empty" size={14} color="#14B8A6" />
            </View>
            <View>
              <Text className="text-[#1E3A8A] font-black text-lg">2</Text>
              <Text className="text-slate-500 text-[10px] font-semibold mb-0.5">Discharges</Text>
              <Text className="text-emerald-500 text-[10px] font-bold">+1</Text>
            </View>
          </View>

        </ScrollView>
      </View>

      {/* Main Content Layout (Responsive Flex) */}
      <View className={`px-4 mt-8 flex ${isTablet ? 'flex-row gap-6' : 'flex-col gap-8'}`}>

        {/* Quick Actions */}
        <View className={isTablet ? 'flex-1' : 'w-full'}>
          <Text className="text-slate-500 font-extrabold text-[12px] tracking-widest uppercase mb-4">Quick Actions</Text>
          <View className="flex-row flex-wrap justify-between">

            <TouchableOpacity className="w-[48%] bg-white rounded-2xl border border-slate-100 p-4 mb-3 shadow-sm shadow-slate-200/50 flex-row items-center active:opacity-60">
              <View className="w-10 h-10 rounded-full bg-purple-50 items-center justify-center mr-3">
                <Feather name="edit-2" size={16} color="#8B5CF6" />
              </View>
              <View className="flex-1 pr-1">
                <Text className="text-[#1E3A8A] font-bold text-[12px] mb-0.5">Add Patient Entry</Text>
                <Text className="text-slate-400 text-[9px] font-medium leading-tight">Record new OPD or IPD case</Text>
              </View>
              <Feather name="chevron-right" size={12} color="#CBD5E1" />
            </TouchableOpacity>

            <TouchableOpacity className="w-[48%] bg-white rounded-2xl border border-slate-100 p-4 mb-3 shadow-sm shadow-slate-200/50 flex-row items-center active:opacity-60">
              <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center mr-3">
                <MaterialCommunityIcons name="file-document-outline" size={18} color="#10B981" />
              </View>
              <View className="flex-1 pr-1">
                <Text className="text-[#1E3A8A] font-bold text-[12px] mb-0.5">Request Indent</Text>
                <Text className="text-slate-400 text-[9px] font-medium leading-tight">Order medicines from BMO</Text>
              </View>
              <Feather name="chevron-right" size={12} color="#CBD5E1" />
            </TouchableOpacity>

            <TouchableOpacity className="w-[48%] bg-white rounded-2xl border border-slate-100 p-4 mb-3 shadow-sm shadow-slate-200/50 flex-row items-center active:opacity-60">
              <View className="w-10 h-10 rounded-full bg-orange-50 items-center justify-center mr-3">
                <Feather name="user-plus" size={16} color="#F97316" />
              </View>
              <View className="flex-1 pr-1">
                <Text className="text-[#1E3A8A] font-bold text-[12px] mb-0.5">Refer Patient</Text>
                <Text className="text-slate-400 text-[9px] font-medium leading-tight">Refer to higher facility</Text>
              </View>
              <Feather name="chevron-right" size={12} color="#CBD5E1" />
            </TouchableOpacity>

            <TouchableOpacity className="w-[48%] bg-white rounded-2xl border border-slate-100 p-4 mb-3 shadow-sm shadow-slate-200/50 flex-row items-center active:opacity-60">
              <View className="w-10 h-10 rounded-full bg-red-50 items-center justify-center mr-3">
                <MaterialCommunityIcons name="flask-empty-outline" size={18} color="#EF4444" />
              </View>
              <View className="flex-1 pr-1">
                <Text className="text-[#1E3A8A] font-bold text-[12px] mb-0.5">Lab Test Entry</Text>
                <Text className="text-slate-400 text-[9px] font-medium leading-tight">Record lab test results</Text>
              </View>
              <Feather name="chevron-right" size={12} color="#CBD5E1" />
            </TouchableOpacity>

            <TouchableOpacity className="w-[48%] bg-white rounded-2xl border border-slate-100 p-4 shadow-sm shadow-slate-200/50 flex-row items-center active:opacity-60">
              <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
                <Feather name="calendar" size={16} color="#3B82F6" />
              </View>
              <View className="flex-1 pr-1">
                <Text className="text-[#1E3A8A] font-bold text-[12px] mb-0.5">View Appointments</Text>
                <Text className="text-slate-400 text-[9px] font-medium leading-tight">Today's scheduled appointments</Text>
              </View>
              <Feather name="chevron-right" size={12} color="#CBD5E1" />
            </TouchableOpacity>

            <TouchableOpacity className="w-[48%] bg-white rounded-2xl border border-slate-100 p-4 shadow-sm shadow-slate-200/50 flex-row items-center active:opacity-60">
              <View className="w-10 h-10 rounded-full bg-teal-50 items-center justify-center mr-3">
                <Feather name="book-open" size={16} color="#14B8A6" />
              </View>
              <View className="flex-1 pr-1">
                <Text className="text-[#1E3A8A] font-bold text-[12px] mb-0.5">Health Education</Text>
                <Text className="text-slate-400 text-[9px] font-medium leading-tight">View IEC materials & resources</Text>
              </View>
              <Feather name="chevron-right" size={12} color="#CBD5E1" />
            </TouchableOpacity>

          </View>
        </View>

        {/* Today's Tasks */}
        <View className={isTablet ? 'w-[320px]' : 'w-full'}>
          <Text className="text-slate-500 font-extrabold text-[12px] tracking-widest uppercase mb-4">Today's Tasks</Text>
          <View className="bg-white rounded-[24px] border border-slate-100 shadow-sm shadow-slate-200/50 p-4 relative overflow-hidden">
            {/* Faint clipboard icon background */}
            <MaterialCommunityIcons name="clipboard-check-outline" size={120} color="#F1F5F9" style={{ position: 'absolute', top: -10, right: -20, opacity: 0.5, transform: [{ rotate: '15deg' }] }} />

            <View className="flex-col gap-4 relative z-10">

              <View className="flex-row items-start justify-between border-b border-slate-50 pb-4">
                <View className="flex-row items-center flex-1">
                  <View className="w-5 h-5 rounded-full bg-emerald-500 items-center justify-center mr-3 mt-0.5">
                    <Feather name="check" size={12} color="white" />
                  </View>
                  <View>
                    <Text className="text-slate-800 font-bold text-[13px] line-through opacity-70">Morning OPD Rounds</Text>
                    <Text className="text-slate-400 text-[10px] font-medium mt-0.5">General OPD Consultation</Text>
                  </View>
                </View>
                <Text className="text-slate-400 text-[9px] font-bold mt-1">09:00 AM</Text>
              </View>

              <View className="flex-row items-start justify-between border-b border-slate-50 pb-4">
                <View className="flex-row items-center flex-1">
                  <View className="w-5 h-5 rounded-full border-2 border-slate-300 mr-3 mt-0.5" />
                  <View>
                    <Text className="text-[#1E3A8A] font-bold text-[13px]">Dengue Surveillance Report</Text>
                    <Text className="text-slate-400 text-[10px] font-medium mt-0.5">Daily Reporting</Text>
                  </View>
                </View>
                <Text className="text-slate-400 text-[9px] font-bold mt-1">11:00 AM</Text>
              </View>

              <View className="flex-row items-start justify-between border-b border-slate-50 pb-4">
                <View className="flex-row items-center flex-1">
                  <View className="w-5 h-5 rounded-full border-2 border-slate-300 mr-3 mt-0.5" />
                  <View>
                    <Text className="text-[#1E3A8A] font-bold text-[13px]">Vaccine Session</Text>
                    <Text className="text-slate-400 text-[10px] font-medium mt-0.5">Immunization Drive</Text>
                  </View>
                </View>
                <Text className="text-slate-400 text-[9px] font-bold mt-1">01:00 PM</Text>
              </View>

              <View className="flex-row items-start justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-5 h-5 rounded-full border-2 border-slate-300 mr-3 mt-0.5" />
                  <View>
                    <Text className="text-[#1E3A8A] font-bold text-[13px]">Inventory Verification</Text>
                    <Text className="text-slate-400 text-[10px] font-medium mt-0.5">Stock Check</Text>
                  </View>
                </View>
                <Text className="text-slate-400 text-[9px] font-bold mt-1">03:00 PM</Text>
              </View>

            </View>

            <TouchableOpacity className="mt-5 bg-[#F8FAFC] py-3 rounded-xl flex-row items-center justify-center border border-slate-100">
              <Text className="text-blue-600 font-bold text-[11px] mr-1">View All Tasks</Text>
              <Feather name="chevron-right" size={14} color="#3B82F6" />
            </TouchableOpacity>

          </View>
        </View>

      </View>

      {/* Facility Status Footer */}
      <View className="px-4 mt-8 mb-4">
        <View className="bg-[#F0FDF4] border border-emerald-100 rounded-3xl p-5 shadow-sm shadow-emerald-100/50">
          <View className="flex-row justify-between items-center mb-5">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-emerald-500 items-center justify-center shadow-sm shadow-emerald-500/30 mr-3 border-2 border-white">
                <Feather name="shield" size={18} color="white" />
              </View>
              <View>
                <Text className="text-emerald-800 font-black text-[15px] mb-0.5 tracking-tight">Facility Status: Operational</Text>
                <View className="bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 self-start">
                  <Text className="text-emerald-700 font-bold text-[9px]">All Systems Normal</Text>
                </View>
              </View>
            </View>
          </View>

          <View className="flex-row justify-between flex-wrap gap-y-4">

            <View className="flex-row items-center w-[48%]">
              <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-2 border border-emerald-200">
                <Feather name="wifi" size={10} color="#059669" />
              </View>
              <View>
                <Text className="text-slate-500 font-semibold text-[9px]">Internet</Text>
                <Text className="text-emerald-700 font-bold text-[10px]">Connected</Text>
              </View>
            </View>

            <View className="flex-row items-center w-[48%]">
              <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-2 border border-emerald-200">
                <Feather name="cloud" size={10} color="#059669" />
              </View>
              <View>
                <Text className="text-slate-500 font-semibold text-[9px]">EMR Sync</Text>
                <Text className="text-emerald-700 font-bold text-[10px]">Synced</Text>
              </View>
            </View>

            <View className="flex-row items-center w-[48%]">
              <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-2 border border-emerald-200">
                <Feather name="refresh-cw" size={10} color="#059669" />
              </View>
              <View>
                <Text className="text-slate-500 font-semibold text-[9px]">Last Sync</Text>
                <Text className="text-emerald-700 font-bold text-[10px]">5 min ago</Text>
              </View>
            </View>

            <View className="flex-row items-center w-[48%]">
              <View className="w-6 h-6 rounded-full bg-emerald-100 items-center justify-center mr-2 border border-emerald-200">
                <Feather name="lock" size={10} color="#059669" />
              </View>
              <View>
                <Text className="text-slate-500 font-semibold text-[9px]">Data Security</Text>
                <Text className="text-emerald-700 font-bold text-[10px]">Secure</Text>
              </View>
            </View>

          </View>
        </View>
      </View>

    </ScrollView>
  );
}
