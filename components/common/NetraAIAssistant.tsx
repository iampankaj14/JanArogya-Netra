import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Modal, Pressable, TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';

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
      text: "Hello, I am Netra, your District Health Intelligence Assistant. How can I help you manage PHC operations, monitor outbreaks, or coordinate supply redistributions today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const getSmartResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes('dengue') || q.includes('outbreak')) {
      return "I have detected a 150% surge in Dengue cases at Rampur Kalan PHC. I recommend initiating a transfer of 50 NS1 test kits from Dharampur PHC immediately, which has a surplus of 200 kits.";
    }
    if (q.includes('paracetamol') || q.includes('shortage') || q.includes('medicine')) {
      return "Current stock levels show Paracetamol 500mg at Rampur Kalan PHC is depleted (120 tablets left, daily run rate of 60). We have a surplus of 800 tablets at Dharampur PHC. Would you like to draft a transfer request?";
    }
    if (q.includes('doctor') || q.includes('attendance') || q.includes('absent')) {
      return "Daily attendance logs indicate Dr. Sarita Varma (PHC MO at Rampur Kalan) is absent today. Alternate medical coverage has been requested from Kheri PHC.";
    }
    if (q.includes('beds') || q.includes('capacity')) {
      return "Rampur Kalan PHC is currently running at 88% capacity (7/8 beds occupied). Kheri PHC is at 33% capacity (2/6 occupied) and can receive non-emergency patient transfers if required.";
    }
    return "I have analyzed the current district health indicators. Overall health score is stable at 68/100, but Rampur Kalan PHC requires attention due to critical resource stockouts. Let me know if you would like me to compile the weekly epidemiological summary.";
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
    }, 1200);
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
        className="flex-1 justify-end bg-slate-950/60"
      >
        <View className="bg-slate-900 border-t border-slate-800/80 rounded-t-[36px] h-[80%] shadow-2xl flex-col">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-5 border-b border-slate-800/50">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-blue-500/10 items-center justify-center mr-3 border border-blue-500/20">
                <Feather name="eye" size={20} color="#60A5FA" />
              </View>
              <View>
                <Text className="text-white font-bold text-base">Netra AI Assistant</Text>
                <Text className="text-slate-400 text-xs font-semibold">Active Command Advisor</Text>
              </View>
            </View>
            <Pressable
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center active:bg-slate-700"
            >
              <Feather name="x" size={18} color="#94A3B8" />
            </Pressable>
          </View>

          {/* Messages List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 24, paddingBottom: 32 }}
            renderItem={({ item }) => (
              <View
                className={`flex-row mb-4 ${
                  item.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {item.sender === 'ai' && (
                  <View className="w-8 h-8 rounded-full bg-blue-600/10 items-center justify-center mr-2 border border-blue-500/20 self-end">
                    <Feather name="eye" size={14} color="#60A5FA" />
                  </View>
                )}
                <View
                  className={`max-w-[75%] p-4 rounded-3xl ${
                    item.sender === 'user'
                      ? 'bg-blue-600 rounded-tr-sm text-white'
                      : 'bg-slate-800/80 border border-slate-700/30 rounded-tl-sm text-slate-100'
                  }`}
                >
                  <Text className="text-white text-[14px] leading-[20px] font-medium selection:bg-blue-500">
                    {item.text}
                  </Text>
                  <Text className="text-[10px] text-slate-400 mt-1.5 self-end">
                    {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            )}
          />

          {loading && (
            <View className="flex-row items-center px-6 py-2">
              <View className="w-8 h-8 rounded-full bg-blue-600/10 items-center justify-center mr-2 border border-blue-500/20">
                <Feather name="eye" size={14} color="#60A5FA" />
              </View>
              <View className="bg-slate-800/80 border border-slate-700/30 rounded-3xl px-4 py-3 flex-row items-center">
                <ActivityIndicator size="small" color="#60A5FA" className="mr-2" />
                <Text className="text-slate-400 text-xs font-semibold">Netra is thinking...</Text>
              </View>
            </View>
          )}

          {/* Footer Input */}
          <View className="p-4 border-t border-slate-800/50 bg-slate-900/90 flex-row items-center">
            <TextInput
              className="flex-1 bg-slate-800 border border-slate-700/40 rounded-full px-5 py-3 text-white text-sm font-medium mr-3"
              placeholder="Ask Netra about outbreaks, stocks..."
              placeholderTextColor="#64748B"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleSend}
            />
            <Pressable
              onPress={handleSend}
              className="w-12 h-12 rounded-full bg-blue-600 items-center justify-center active:bg-blue-700 shadow-lg"
            >
              <Feather name="send" size={18} color="white" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default NetraAIAssistant;
