import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Modal, Pressable, TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Animated } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { localMedicines } from '@/services/repositories/localDb';

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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hello! I am Netra, your District Health Intelligence Assistant. How can I help you manage PHC operations, monitor outbreaks, or coordinate supplies today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const getSmartResponse = (query: string): string => {
    const q = query.toLowerCase();
    
    const pcmBarola = localMedicines.find(m => m.facilityId === 'phc_barola' && m.name.toLowerCase().includes('paracetamol'));
    const pcmBadalpur = localMedicines.find(m => m.facilityId === 'phc_badalpur' && m.name.toLowerCase().includes('paracetamol'));
    const dengueBarola = localMedicines.find(m => m.facilityId === 'phc_barola' && m.name.toLowerCase().includes('dengue'));
    const dengueBadalpur = localMedicines.find(m => m.facilityId === 'phc_badalpur' && m.name.toLowerCase().includes('dengue'));

    if (q.includes('dengue') || q.includes('outbreak')) {
      return `I have detected a 150% surge in Dengue cases at PHC Badalpur. I recommend initiating a transfer of 50 NS1 test kits from PHC Barola immediately, which has a surplus of ${dengueBarola?.currentStock || 200} kits.`;
    }
    if (q.includes('paracetamol') || q.includes('shortage') || q.includes('medicine')) {
      return `Current stock levels show Paracetamol 650mg at PHC Badalpur is depleted (${pcmBadalpur?.currentStock || 120} tablets left, daily run rate of 60). We have a surplus of ${pcmBarola?.currentStock || 800} tablets at PHC Barola. Would you like to draft a transfer request?`;
    }
    if (q.includes('doctor') || q.includes('attendance') || q.includes('absent')) {
      return "Daily attendance logs indicate Dr. Sarita Varma (PHC MO at Badalpur) is absent today. Alternate medical coverage has been requested from UPHC Surajpur.";
    }
    if (q.includes('beds') || q.includes('capacity')) {
      return "PHC Badalpur is currently running at 88% capacity (7/8 beds occupied). UPHC Surajpur is at 33% capacity (2/6 occupied) and can receive non-emergency patient transfers if required.";
    }
    return "I have analyzed the current district health indicators. Overall health score is stable at 68/100, but PHC Badalpur requires attention due to critical resource stockouts. Let me know if you would like me to compile the weekly epidemiological summary.";
  };

  const handleSend = () => {
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

    setTimeout(() => {
      const aiResponseText = getSmartResponse(currentInput);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
    }, 1500);
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
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end bg-slate-900/40"
      >
        <View className="bg-[#F8FAFC] rounded-t-[36px] h-[85%] shadow-2xl flex-col overflow-hidden">
          
          {/* Header */}
          <View className="bg-white flex-row items-center justify-between px-6 py-5 border-b border-slate-100 z-10 shadow-sm">
            <View className="flex-row items-center">
              <View className="w-11 h-11 rounded-full bg-blue-50 items-center justify-center mr-3 border border-blue-100">
                <MaterialCommunityIcons name="robot-outline" size={24} color="#208AEF" />
              </View>
              <View>
                <Text className="text-slate-900 font-extrabold text-[17px] tracking-tight">Netra AI</Text>
                <View className="flex-row items-center mt-0.5">
                  <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                  <Text className="text-slate-500 text-xs font-semibold">Active Command Advisor</Text>
                </View>
              </View>
            </View>
            <Pressable
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center active:bg-slate-100 border border-slate-100"
            >
              <Feather name="x" size={20} color="#64748B" />
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
                className={`flex-row mb-5 ${
                  item.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {item.sender === 'ai' && (
                  <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-2 border border-blue-100 self-end mb-1">
                    <MaterialCommunityIcons name="robot-outline" size={16} color="#208AEF" />
                  </View>
                )}
                <View
                  className={`max-w-[78%] px-4 py-3 shadow-sm ${
                    item.sender === 'user'
                      ? 'bg-[#208AEF] rounded-[20px] rounded-br-[4px]'
                      : 'bg-white border border-slate-100 rounded-[20px] rounded-bl-[4px]'
                  }`}
                >
                  <Text 
                    className={`text-[14.5px] leading-[22px] font-medium ${
                      item.sender === 'user' ? 'text-white' : 'text-slate-700'
                    }`}
                  >
                    {item.text}
                  </Text>
                  <Text 
                    className={`text-[9px] mt-1.5 font-bold ${
                      item.sender === 'user' ? 'text-blue-100 self-end' : 'text-slate-400 self-start'
                    }`}
                  >
                    {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            )}
          />

          {/* Loading Indicator */}
          {loading && (
            <View className="flex-row items-center px-6 py-2 pb-6">
              <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-2 border border-blue-100">
                <MaterialCommunityIcons name="robot-outline" size={16} color="#208AEF" />
              </View>
              <View className="bg-white border border-slate-100 rounded-full px-4 py-2.5 flex-row items-center shadow-sm">
                <ActivityIndicator size="small" color="#208AEF" className="mr-2" />
                <Text className="text-slate-500 text-[13px] font-bold">Netra is thinking...</Text>
              </View>
            </View>
          )}

          {/* Footer Input */}
          <View className="px-5 py-4 bg-white border-t border-slate-100 flex-row items-end shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <View className="flex-1 bg-[#F1F5F9] border border-slate-200 rounded-[24px] min-h-[48px] max-h-[120px] flex-row items-center px-4 mr-3">
              <TextInput
                className="flex-1 text-slate-800 text-[15px] font-medium py-3"
                placeholder="Ask Netra about outbreaks..."
                placeholderTextColor="#94A3B8"
                value={input}
                onChangeText={setInput}
                multiline
                maxLength={500}
              />
            </View>
            <Pressable
              onPress={handleSend}
              disabled={!input.trim()}
              className={`w-[48px] h-[48px] rounded-full items-center justify-center shadow-md mb-0.5 ${
                input.trim() ? 'bg-[#208AEF] shadow-blue-500/30' : 'bg-slate-200 shadow-none'
              }`}
            >
              <Feather name="send" size={18} color={input.trim() ? "white" : "#94A3B8"} style={{ marginLeft: -2, marginTop: 2 }} />
            </Pressable>
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default NetraAIAssistant;
