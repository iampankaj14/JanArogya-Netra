const fs = require('fs');
let file = 'components/features/dashboard/PHCHomeDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add borders to other cards
content = content.replace(/className=\"bg-blue-50\\/50 border border-blue-100/g, 'className=\"bg-blue-50/50 border-2 border-blue-200');
content = content.replace(/className=\"bg-white rounded-3xl p-5 mb-2 shadow-sm shadow-slate-200\\/50 border border-slate-100\"/g, 'className=\"bg-white rounded-3xl p-5 mb-2 shadow-sm shadow-slate-200/50 border-2 border-blue-200\"');
content = content.replace(/className=\"bg-white border border-red-200/g, 'className=\"bg-white border-2 border-red-200');
content = content.replace(/className=\"bg-white px-4 py-6 shadow-sm border-b border-slate-100/g, 'className=\"bg-white px-4 py-6 shadow-sm border-b-2 border-blue-200');
content = content.replace(/className=\"bg-white px-4 py-6 rounded-b-3xl shadow-sm border-b border-slate-100/g, 'className=\"bg-white px-4 py-6 rounded-b-3xl shadow-sm border-b-2 border-blue-200');

// Replace the hardcoded scroll view items with a map
const scrollStart = content.indexOf('<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>');
const scrollEnd = content.indexOf('</ScrollView>', scrollStart) + '</ScrollView>'.length;

const newScrollContent = `<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
          {[
            { id: 'newPatients', value: newPatients, label: t('dashboardNewPatients'), icon: 'user-plus', color: '#3B82F6', bg: 'bg-blue-50' },
            { id: 'referrals', value: referrals, label: t('dashboardReferrals'), icon: 'hospital-building', color: '#10B981', bg: 'bg-emerald-50', iconFamily: 'MaterialCommunityIcons' },
            { id: 'labTests', value: labTests, label: t('dashboardLabTests'), icon: 'user-check', color: '#F97316', bg: 'bg-orange-50' },
            { id: 'followUps', value: followUps, label: t('dashboardFollowUps'), icon: 'users', color: '#8B5CF6', bg: 'bg-purple-50' },
            { id: 'discharges', value: discharges, label: t('dashboardDischarges'), icon: 'bed-empty', color: '#14B8A6', bg: 'bg-teal-50', iconFamily: 'MaterialCommunityIcons' }
          ].map((item) => (
            <View key={item.id} className="bg-white border-2 border-blue-200 rounded-2xl py-3 px-4 flex-row items-center shadow-sm shadow-slate-200/50 min-w-[120px]">
              <View className={\`w-8 h-8 rounded-full \${item.bg} items-center justify-center mr-3\`}>
                {item.iconFamily === 'MaterialCommunityIcons' ? (
                  <MaterialCommunityIcons name={item.icon as any} size={14} color={item.color} />
                ) : (
                  <Feather name={item.icon as any} size={14} color={item.color} />
                )}
              </View>
              <View>
                <Text className="text-[#1E3A8A] font-black text-lg">{item.value}</Text>
                <Text className="text-slate-500 text-[10px] font-semibold mb-0.5">{item.label}</Text>
              </View>
            </View>
          ))}
        </ScrollView>`;

content = content.substring(0, scrollStart) + newScrollContent + content.substring(scrollEnd);

fs.writeFileSync(file, content);
console.log('PHCHomeDashboard updated');
