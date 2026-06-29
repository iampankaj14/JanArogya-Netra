import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ScreenContainer from '@/components/ui/layout/ScreenContainer';
import PageHeader from '@/components/ui/layout/PageHeader';
import SectionHeader from '@/components/ui/layout/SectionHeader';
import MetricCard from '@/components/ui/cards/MetricCard';
import ReportCard from '@/components/ui/cards/ReportCard';
import LineChart from '@/components/ui/charts/LineChart';
import AreaChart from '@/components/ui/charts/AreaChart';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import OutlineButton from '@/components/ui/buttons/OutlineButton';
import FilterChips from '@/components/ui/inputs/FilterChips';
import { dummyReports } from '@/dummy/reports';

export default function ReportsScreen() {
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'REPORTS'>('ANALYTICS');
  const [reportType, setReportType] = useState('ALL');
  const [exporting, setExporting] = useState(false);

  const reportFilters = ['ALL', 'Epidemiological', 'Inventory Audit', 'Performance'];

  const filteredReports = dummyReports.filter(r => 
    reportType === 'ALL' || r.type === reportType
  );

  const handleExportData = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      alert('CSV summary exported to downloads.');
    }, 1500);
  };

  return (
    <ScreenContainer>
      <PageHeader 
        title="Intelligence Audits & Reports" 
        subtitle="Historical summaries, outbreak records, and quality metrics"
      />

      {/* Top Selector Tabs */}
      <View className="flex-row bg-slate-900 border border-slate-800 rounded-2xl p-1 mb-6">
        <Pressable
          onPress={() => setActiveTab('ANALYTICS')}
          className={`flex-1 py-3 items-center rounded-xl ${activeTab === 'ANALYTICS' ? 'bg-blue-600' : 'bg-transparent'}`}
        >
          <Text className={`text-xs font-bold ${activeTab === 'ANALYTICS' ? 'text-white' : 'text-slate-400'}`}>
            Impact Analytics
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('REPORTS')}
          className={`flex-1 py-3 items-center rounded-xl ${activeTab === 'REPORTS' ? 'bg-blue-600' : 'bg-transparent'}`}
        >
          <Text className={`text-xs font-bold ${activeTab === 'REPORTS' ? 'text-white' : 'text-slate-400'}`}>
            Audit Catalog
          </Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {activeTab === 'ANALYTICS' ? (
          <View>
            {/* Impact Dashboard KPIs */}
            <View className="flex-row flex-wrap -mx-2 mb-4">
              <View className="w-1/2 px-2 mb-4">
                <MetricCard
                  title="Stockouts Avoided"
                  value="42 cases"
                  change="+12"
                  isPositiveChange={true}
                  color="#10B981"
                  icon="success"
                />
              </View>
              <View className="w-1/2 px-2 mb-4">
                <MetricCard
                  title="Avg Redistribution Time"
                  value="4.5 hrs"
                  change="-1.2 hrs"
                  isPositiveChange={true}
                  color="#10B981"
                  icon="refresh"
                />
              </View>
            </View>

            {/* AI Generated Quality Summary */}
            <View className="mb-6 bg-slate-900/60 border border-slate-800/40 p-5 rounded-3xl">
              <View className="flex-row items-center mb-3">
                <View className="w-9 h-9 rounded-full bg-blue-500/10 items-center justify-center mr-3 border border-blue-500/20">
                  <Feather name="eye" size={18} color="#60A5FA" />
                </View>
                <Text className="text-white font-extrabold text-sm">Data Integrity Summary</Text>
              </View>
              <Text className="text-slate-300 text-xs leading-relaxed">
                Daily registers indicate <Text className="text-green-400 font-bold">98.2% data completeness</Text> across all 14 PHCs. Kheri PHC has resolved its previous sync delay. Recommended action: None.
              </Text>
            </View>

            {/* Capacity fill rate timeline */}
            <SectionHeader title="PHC Capacity Fill Rates (Timeline)" />
            <View className="mb-6">
              <AreaChart title="Capacity occupancy curves" />
            </View>

            {/* Monthly stock comparisons */}
            <SectionHeader title="Pharma Distribution Metrics" />
            <View className="mb-6">
              <LineChart />
            </View>

            {/* Action export buttons */}
            <View className="flex-row space-x-3 mt-2">
              <View className="flex-1">
                <PrimaryButton 
                  title="Export telemetry" 
                  loading={exporting}
                  onPress={handleExportData}
                />
              </View>
              <View className="flex-1">
                <OutlineButton 
                  title="Print graphics" 
                  onPress={() => alert('Sending layout to print server...')}
                />
              </View>
            </View>
          </View>
        ) : (
          <View>
            {/* Filter Catalog */}
            <View className="mb-4">
              <Text className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-2 px-1">Filter audits by category</Text>
              <FilterChips
                options={reportFilters}
                selectedOption={reportType}
                onSelectOption={setReportType}
              />
            </View>

            {/* Reports List */}
            {filteredReports.map((report) => (
              <View className="mb-4" key={report.id}>
                <ReportCard
                  title={report.title}
                  type={report.type}
                  date={report.date}
                  generatedBy={report.generatedBy}
                  onDownload={() => alert(`Opening PDF Audit: ${report.title}`)}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
