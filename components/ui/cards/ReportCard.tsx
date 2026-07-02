import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { formatDate } from '../../../utils/formatters';

interface ReportCardProps {
  title: string;
  type: string;
  date: string | Date;
  generatedBy: string;
  onDownload?: () => void;
  loading?: boolean;
}

export function ReportCard({
  title,
  type,
  date,
  generatedBy,
  onDownload,
  loading = false,
}: ReportCardProps) {
  if (loading) {
    return (
      <View className="bg-white p-4 rounded-2xl border border-slate-100 items-center justify-center min-h-[90px]">
        <ActivityIndicator color="#0B1D3A" />
      </View>
    );
  }

  return (
    <View className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex-row items-center justify-between">
      <View className="flex-1 mr-4">
        <View className="flex-row items-center mb-1">
          <Feather name="file-text" size={16} color="#6C757D" />
          <Text className="text-slate-400 text-xs font-bold ml-1.5 capitalize">{type}</Text>
        </View>
        <Text className="text-brand-navy font-extrabold text-base mb-1" numberOfLines={1}>
          {title}
        </Text>
        <Text className="text-slate-400 text-xs">
          By {generatedBy} • {formatDate(date)}
        </Text>
      </View>

      {onDownload && (
        <Pressable
          onPress={onDownload}
          style={({ pressed }) => [pressed && { opacity: 0.85 }]}
          className="w-10 h-10 bg-slate-50 active:bg-slate-100 border border-slate-100 rounded-xl justify-center items-center"
        >
          <Feather name="download" size={18} color="#0B1D3A" />
        </Pressable>
      )}
    </View>
  );
}

export default ReportCard;
