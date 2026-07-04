import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Modal, Pressable, TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import geminiService from '@/services/ai/geminiService';

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
      text: "Hello! I am Netra, your District Health Intelligence Assistant powered by Google Gemini. How can I help you manage PHC operations, monitor outbreaks, or coordinate supplies today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

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
      // Gemini requires the history to start with a 'user' role.
      // The first message is our hardcoded AI welcome, so we exclude it.
      const validMessages = messages.length > 0 && messages[0].sender === 'ai' 
        ? messages.slice(1) 
        : messages;

      const chatHistory = validMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model' as const,
        parts: msg.text
      }));

      const aiResponseText = await geminiService.askNetra(currentInput, chatHistory);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "I encountered an error connecting to my intelligence network. Please try again.",
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
