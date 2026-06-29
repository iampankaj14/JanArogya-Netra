import React, { useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenContainer from '@/components/ui/layout/ScreenContainer';
import PageHeader from '@/components/ui/layout/PageHeader';
import SearchBar from '@/components/ui/inputs/SearchBar';
import FilterChips from '@/components/ui/inputs/FilterChips';
import PHCCard from '@/components/ui/cards/PHCCard';
import EmptyState from '@/components/ui/feedback/EmptyState';
import { dummyPHCs } from '@/dummy/phcs';

export default function PHCsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const blocks = ['ALL', 'Rampur', 'Dharampur', 'Sewapur'];
  const statuses = ['ALL', 'critical', 'warning', 'adequate'];

  // Filtering Logic
  const filteredPHCs = dummyPHCs.filter((phc) => {
    const matchesSearch =
      phc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phc.block.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBlock = selectedBlock === 'ALL' || phc.block === selectedBlock;
    
    const matchesStatus = selectedStatus === 'ALL' || phc.stockStatus === selectedStatus;

    return matchesSearch && matchesBlock && matchesStatus;
  });

  const handlePHCPress = (id: string) => {
    router.push({
      pathname: '/phc-detail',
      params: { id }
    });
  };

  return (
    <ScreenContainer>
      <PageHeader 
        title="Primary Health Centers" 
        subtitle="Operational directories and real-time score registries"
      />

      {/* Sticky Filters & Search Header */}
      <View className="mb-4 space-y-3 px-1">
        <SearchBar
          placeholder="Search by center name or block..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <View className="space-y-2">
          {/* Blocks filter row */}
          <View>
            <Text className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1 px-1">Filter by block</Text>
            <FilterChips
              options={blocks}
              selectedOption={selectedBlock}
              onSelectOption={setSelectedBlock}
            />
          </View>

          {/* Statuses filter row */}
          <View>
            <Text className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1 px-1">Filter by stock health</Text>
            <FilterChips
              options={statuses}
              selectedOption={selectedStatus}
              onSelectOption={setSelectedStatus}
            />
          </View>
        </View>
      </View>

      {/* PHC Cards Directory List */}
      <FlatList
        data={filteredPHCs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View className="mb-4">
            <PHCCard
              name={item.name}
              block={item.block}
              healthScore={item.healthScore}
              doctorAvailable={item.doctorAvailable}
              stockStatus={item.stockStatus}
              activeAlertsCount={item.activeAlertsCount}
              onPress={() => handlePHCPress(item.id)}
            />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            title="No Facilities Found"
            description="No health centers matched your selected blocks or status metrics."
            icon="hospital"
            actionLabel="Reset Search Filters"
            onActionPress={() => {
              setSearchQuery('');
              setSelectedBlock('ALL');
              setSelectedStatus('ALL');
            }}
          />
        }
      />
    </ScreenContainer>
  );
}
