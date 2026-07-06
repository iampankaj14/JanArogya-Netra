import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Modal, Pressable, TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Image, ScrollView } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import geminiService from '@/services/ai/geminiService';
import speechService from '@/services/ai/speechService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '@/hooks/useTranslation';
import { LinearGradient } from 'expo-linear-gradient';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface NetraAIAssistantProps {
  visible: boolean;
  onClose: () => void;
}

export function NetraAIAssistant({ visible, onClose }: NetraAIAssistantProps) {
  const { t, language } = useTranslation();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: t('netraAiGreeting'),
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Speak initial greeting when opened if audio is enabled
    if (visible && messages.length === 1) {
      AsyncStorage.getItem('netraAudioEnabled').then(setting => {
        if (setting !== 'false') {
          speechService.speak(messages[0].text, language === 'hi' ? 'hi-IN' : 'en-US');
        }
      });
    }
  }, [visible]);

  const handleClose = () => {
    speechService.stopSpeaking();
    onClose();
  };

  const quickActions = [
    { id: 'dashboard', title: t('netraAiActionDashboardTitle'), desc: t('netraAiActionDashboardDesc'), icon: 'chart-bar', family: 'MaterialCommunityIcons', color: '#6366F1', bg: '#E0E7FF' },
    { id: 'stock', title: t('netraAiActionStockTitle'), desc: t('netraAiActionStockDesc'), icon: 'pill', family: 'MaterialCommunityIcons', color: '#10B981', bg: '#D1FAE5' },
    { id: 'footfall', title: t('netraAiActionFootfallTitle'), desc: t('netraAiActionFootfallDesc'), icon: 'account-group', family: 'MaterialCommunityIcons', color: '#F59E0B', bg: '#FEF3C7' },
    { id: 'beds', title: t('netraAiActionBedsTitle'), desc: t('netraAiActionBedsDesc'), icon: 'bed', family: 'MaterialCommunityIcons', color: '#F43F5E', bg: '#FFE4E6' },
    { id: 'attendance', title: t('netraAiActionAttendanceTitle'), desc: t('netraAiActionAttendanceDesc'), icon: 'account-check', family: 'MaterialCommunityIcons', color: '#8B5CF6', bg: '#EDE9FE' },
    { id: 'alerts', title: t('netraAiActionAlertsTitle'), desc: t('netraAiActionAlertsDesc'), icon: 'bell', family: 'MaterialCommunityIcons', color: '#3B82F6', bg: '#DBEAFE' },
  ];

  const handleQuickAction = async (action: typeof quickActions[0]) => {
    setShowQuickMenu(false);
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: action.title,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Simulate slight network delay for realism
    setTimeout(async () => {
      const responseMap: Record<string, string> = {
        dashboard: t('netraAiResponseDashboard'),
        stock: t('netraAiResponseStock'),
        footfall: t('netraAiResponseFootfall'),
        beds: t('netraAiResponseBeds'),
        attendance: t('netraAiResponseAttendance'),
        alerts: t('netraAiResponseAlerts'),
      };
      const responseText = responseMap[action.id] || '';

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: responseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);

      const audioSetting = await AsyncStorage.getItem('netraAudioEnabled');
      if (audioSetting !== 'false') {
        speechService.speak(responseText, language === 'hi' ? 'hi-IN' : 'en-US');
      }
    }, 800);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const validMessages = messages.length > 0 && messages[0].sender === 'ai' 
        ? messages.slice(1) 
        : messages;

      const chatHistory = validMessages.map(msg => ({
        role: (msg.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
        parts: msg.text
      }));

      const aiResponseText = await geminiService.askNetra(currentInput, chatHistory, language);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Check setting before speaking
      const audioSetting = await AsyncStorage.getItem('netraAudioEnabled');
      if (audioSetting !== 'false') {
        const speechLang = language === 'hi' ? 'hi-IN' : 'en-US';
        speechService.speak(aiResponseText, speechLang);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: t('netraAiErrorMessage'),
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, loading]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end bg-slate-900/60"
      >
        <View className="rounded-t-[32px] h-[88%] shadow-2xl flex-col overflow-hidden bg-slate-50">
          {/* Chat Background Styling (Stylish Blobs) */}
          <LinearGradient
            colors={['#F8FAFC', '#EEF2FF', '#F5F3FF']}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <View className="absolute top-32 -left-16 w-64 h-64 bg-indigo-300/15 rounded-full" />
          <View className="absolute top-1/2 -right-24 w-80 h-80 bg-emerald-300/15 rounded-full" />
          <View className="absolute bottom-32 left-10 w-48 h-48 bg-purple-300/15 rounded-full" />
          
          {/* Header */}
          <View className="px-6 py-5 z-10 border-b border-indigo-200/60 flex-row items-center justify-between shadow-sm overflow-hidden relative">
            <LinearGradient
              colors={['#C7D2FE', '#DDD6FE', '#E0E7FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            {/* Stronger Decorative Graphics */}
            <View className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-400/20 rounded-full" />
            <View className="absolute -bottom-8 -left-8 w-24 h-24 bg-purple-400/20 rounded-full" />
            <View className="absolute top-2 right-1/3 w-16 h-16 bg-pink-400/20 rounded-full" />

            <View className="flex-row items-center z-10">
              <View className="w-12 h-12 rounded-2xl bg-white items-center justify-center mr-4 border border-indigo-100 shadow-sm shadow-indigo-200/50 overflow-hidden">
                <Image source={require('../../data/netra.png')} style={{width: 32, height: 32}} resizeMode="contain" />
              </View>
              <View>
                <Text className="text-indigo-950 font-extrabold text-[18px] tracking-tight">{t('netraAiName')}</Text>
                <View className="flex-row items-center mt-1">
                  <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 shadow-sm shadow-emerald-500/50" />
                  <Text className="text-indigo-600/80 text-[11px] font-bold uppercase tracking-wider">{t('netraAiOnlineStatus')}</Text>
                </View>
              </View>
            </View>
            <Pressable
              onPress={handleClose}
              className="w-10 h-10 rounded-full bg-white/60 items-center justify-center active:bg-white border border-indigo-100 z-10"
            >
              <Feather name="x" size={20} color="#4F46E5" />
            </Pressable>
          </View>

          {/* Messages List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View
                className={`flex-row mb-6 ${
                  item.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {item.sender === 'ai' && (
                  <View className="w-8 h-8 rounded-full bg-white items-center justify-center mr-3 border border-indigo-100 self-end mb-1 overflow-hidden shadow-sm shadow-indigo-100/50">
                    <Image source={require('../../data/netra.png')} style={{width: 20, height: 20}} resizeMode="contain" />
                  </View>
                )}
                <View
                  className={`max-w-[80%] px-5 py-3.5 shadow-sm ${
                    item.sender === 'user'
                      ? 'bg-indigo-600 rounded-[24px] rounded-br-[4px] shadow-indigo-600/20'
                      : 'bg-indigo-50/80 border border-indigo-200/60 rounded-[24px] rounded-bl-[4px] shadow-indigo-100/50'
                  }`}
                >
                  <Text 
                    className={`text-[15px] leading-[24px] font-medium ${
                      item.sender === 'user' ? 'text-white' : 'text-indigo-950'
                    }`}
                  >
                    {item.text}
                  </Text>
                  <Text 
                    className={`text-[9px] mt-2 font-bold ${
                      item.sender === 'user' ? 'text-indigo-200 self-end' : 'text-indigo-400 self-start'
                    }`}
                  >
                    {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            )}
            ListFooterComponent={
              messages.length === 1 ? (
                <View className="mt-4 flex-row flex-wrap justify-between">
                  {quickActions.map((action) => (
                    <Pressable
                      key={action.id}
                      onPress={() => handleQuickAction(action)}
                      className="rounded-[16px] p-4 mb-3 border shadow-sm overflow-hidden justify-between"
                      style={{ 
                        width: '48%', 
                        minHeight: 140,
                        backgroundColor: action.bg, 
                        borderColor: `${action.color}60`,
                        shadowColor: action.color
                      }}
                    >
                      {/* Background Watermark Icon */}
                      <MaterialCommunityIcons 
                        name={action.icon as any} 
                        size={100} 
                        color={`${action.color}15`} 
                        style={{position: 'absolute', bottom: -20, right: -20, transform: [{rotate: '-15deg'}]}} 
                      />
                      
                      {/* Top Icon Circle */}
                      <View className="flex-row justify-start items-start">
                        <View className="w-10 h-10 rounded-[12px] items-center justify-center bg-white/70 shadow-sm" style={{ shadowColor: action.color, elevation: 1 }}>
                          <MaterialCommunityIcons name={action.icon as any} size={22} color={action.color} />
                        </View>
                      </View>
                      
                      {/* Bottom Texts */}
                      <View className="mt-4">
                        <Text className="text-brand-navy font-extrabold text-[15px] mb-1 leading-tight">{action.title}</Text>
                        <Text className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">{action.desc}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              ) : null
            }
          />

          {/* Loading Indicator */}
          {loading && (
            <View className="flex-row items-center px-6 py-2 pb-6">
              <View className="w-8 h-8 rounded-full bg-indigo-50 items-center justify-center mr-3 border border-indigo-100 overflow-hidden">
                <Image source={require('../../data/netra.png')} style={{width: 20, height: 20}} resizeMode="contain" />
              </View>
              <View className="bg-white border border-slate-100 rounded-full px-5 py-3 flex-row items-center shadow-sm">
                <ActivityIndicator size="small" color="#4F46E5" className="mr-3" />
                <Text className="text-slate-500 text-[13px] font-bold">{t('netraAiThinking')}</Text>
              </View>
            </View>
          )}

          {/* Compact Quick Menu (Toggleable) */}
          {showQuickMenu && (
            <View className="px-4 py-3 bg-slate-50 border-t border-slate-200 shadow-[0_-2px_10px_-4px_rgba(0,0,0,0.1)]">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
                {quickActions.map((action) => (
                  <Pressable
                    key={action.id}
                    onPress={() => handleQuickAction(action)}
                    className="flex-row items-center px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-sm shadow-black/5 mr-2 active:bg-slate-50"
                  >
                    <View className="w-6 h-6 rounded-md items-center justify-center mr-2" style={{ backgroundColor: action.bg }}>
                      <MaterialCommunityIcons name={action.icon as any} size={14} color={action.color} />
                    </View>
                    <Text className="text-slate-700 font-bold text-[12px]">{action.title}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Footer Input */}
          <View className="px-6 py-5 bg-white border-t border-slate-100 flex-row items-center">
            <View className="flex-1 bg-indigo-50/70 border-2 border-indigo-200 rounded-[28px] min-h-[52px] max-h-[120px] flex-row items-center pl-5 pr-2 mr-3 shadow-sm shadow-indigo-200/50">
              <TextInput
                className="flex-1 text-indigo-950 text-[15px] font-semibold py-3.5 pr-2"
                placeholder={t('netraAiInputPlaceholder')}
                placeholderTextColor="#818CF8"
                value={input}
                onChangeText={setInput}
                multiline
                maxLength={500}
              />
              <Pressable
                onPress={() => setShowQuickMenu(!showQuickMenu)}
                className={`w-9 h-9 rounded-full items-center justify-center ${showQuickMenu ? 'bg-indigo-200' : 'bg-white shadow-sm shadow-yellow-100'}`}
              >
                <MaterialCommunityIcons name={showQuickMenu ? "close" : "lightning-bolt"} size={22} color={showQuickMenu ? "#4338CA" : "#EAB308"} />
              </Pressable>
            </View>
            <Pressable
              onPress={handleSend}
              disabled={!input.trim()}
              className={`w-[52px] h-[52px] rounded-full items-center justify-center shadow-md mb-0 ${
                input.trim() ? 'bg-blue-500 shadow-blue-500/30' : 'bg-slate-200 shadow-none'
              }`}
            >
              <Feather name="send" size={20} color={input.trim() ? "white" : "#94A3B8"} style={{ marginLeft: -2, marginTop: 2 }} />
            </Pressable>
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default NetraAIAssistant;
