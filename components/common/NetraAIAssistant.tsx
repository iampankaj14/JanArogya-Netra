import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Modal, Pressable, TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Image, ScrollView } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import geminiService from '@/services/ai/geminiService';
import speechService from '@/services/ai/speechService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { BlurView } from 'expo-blur';
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
  const { i18n } = useTranslation();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: i18n.language === 'hi' 
        ? "नमस्ते! मैं नेत्र हूँ, गूगल जेमिनी द्वारा संचालित आपका ज़िला स्वास्थ्य खुफिया सहायक। आज मैं आपकी कैसे मदद कर सकता हूँ?"
        : "Hello! I am Netra, your District Health Intelligence Assistant. How can I help you manage operations or monitor outbreaks today?",
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
          speechService.speak(messages[0].text, i18n.language === 'hi' ? 'hi-IN' : 'en-US');
        }
      });
    }
  }, [visible]);

  const handleClose = () => {
    speechService.stopSpeaking();
    onClose();
  };

  const quickActions = [
    { id: 'dashboard', title: 'View Dashboard', desc: 'Overview & Insights', icon: 'chart-bar', family: 'MaterialCommunityIcons', color: '#6366F1', bg: '#E0E7FF' },
    { id: 'stock', title: 'Medicine Stock', desc: 'Check Availability', icon: 'pill', family: 'MaterialCommunityIcons', color: '#10B981', bg: '#D1FAE5' },
    { id: 'footfall', title: 'Patient Footfall', desc: "Today's Summary", icon: 'account-group', family: 'MaterialCommunityIcons', color: '#F59E0B', bg: '#FEF3C7' },
    { id: 'beds', title: 'Bed Availability', desc: 'CHC / PHC Status', icon: 'bed', family: 'MaterialCommunityIcons', color: '#F43F5E', bg: '#FFE4E6' },
    { id: 'attendance', title: 'Doctor Attendance', desc: "Today's Report", icon: 'account-check', family: 'MaterialCommunityIcons', color: '#8B5CF6', bg: '#EDE9FE' },
    { id: 'alerts', title: 'Active Alerts', desc: 'View All Alerts', icon: 'bell', family: 'MaterialCommunityIcons', color: '#3B82F6', bg: '#DBEAFE' },
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
      let responseText = '';
      if (action.id === 'dashboard') responseText = "Here's a quick overview: Your PHC has processed 142 patients today. Overall health index is 85%.";
      else if (action.id === 'stock') responseText = "Currently, Paracetamol and ORS packets are running low (below 20%). Other critical stocks are adequate.";
      else if (action.id === 'footfall') responseText = "Today's patient footfall is 142 (Adults: 90, Children: 52). Peak hours were between 10 AM and 1 PM.";
      else if (action.id === 'beds') responseText = "Bed availability: 4 out of 10 beds are currently occupied in your PHC. 6 beds are available.";
      else if (action.id === 'attendance') responseText = "Dr. Sharma and Dr. Gupta are present today. Dr. Singh is on leave.";
      else if (action.id === 'alerts') responseText = "You have 2 active alerts: 1 Low Stock Warning and 1 Dengue Surge Warning in neighboring district.";

      if (i18n.language === 'hi') {
        if (action.id === 'dashboard') responseText = "यहाँ एक त्वरित अवलोकन है: आपके पीएचसी ने आज 142 मरीजों का इलाज किया है। समग्र स्वास्थ्य सूचकांक 85% है।";
        else if (action.id === 'stock') responseText = "वर्तमान में, पैरासिटामोल और ओआरएस पैकेट कम चल रहे हैं (20% से नीचे)। अन्य महत्वपूर्ण स्टॉक पर्याप्त हैं।";
        else if (action.id === 'footfall') responseText = "आज मरीजों की संख्या 142 है (वयस्क: 90, बच्चे: 52)। पीक आवर्स सुबह 10 बजे से दोपहर 1 बजे के बीच थे।";
        else if (action.id === 'beds') responseText = "बेड की उपलब्धता: आपके पीएचसी में 10 में से 4 बेड वर्तमान में भरे हुए हैं। 6 बेड खाली हैं।";
        else if (action.id === 'attendance') responseText = "डॉ. शर्मा और डॉ. गुप्ता आज उपस्थित हैं। डॉ. सिंह छुट्टी पर हैं।";
        else if (action.id === 'alerts') responseText = "आपके पास 2 सक्रिय अलर्ट हैं: 1 लो स्टॉक चेतावनी और पड़ोसी जिले में 1 डेंगू वृद्धि चेतावनी।";
      }

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
        speechService.speak(responseText, i18n.language === 'hi' ? 'hi-IN' : 'en-US');
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

      const aiResponseText = await geminiService.askNetra(currentInput, chatHistory, i18n.language);
      
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
        const speechLang = i18n.language === 'hi' ? 'hi-IN' : 'en-US';
        speechService.speak(aiResponseText, speechLang);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: i18n.language === 'hi' 
          ? "मुझे अपने नेटवर्क से जुड़ने में कोई त्रुटि मिली। कृपया पुनः प्रयास करें।"
          : "I encountered an error connecting to my network. Please try again.",
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
                <Text className="text-indigo-950 font-extrabold text-[18px] tracking-tight">{i18n.language === 'hi' ? 'नेत्र एआई' : 'Netra AI'}</Text>
                <View className="flex-row items-center mt-1">
                  <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 shadow-sm shadow-emerald-500/50" />
                  <Text className="text-indigo-600/80 text-[11px] font-bold uppercase tracking-wider">{i18n.language === 'hi' ? 'सक्रिय' : 'Online'}</Text>
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
                        <Text className="text-brand-navy font-extrabold text-[15px] mb-1 leading-tight">{i18n.language === 'hi' ? action.title : action.title}</Text>
                        <Text className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">{i18n.language === 'hi' ? action.desc : action.desc}</Text>
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
                <Text className="text-slate-500 text-[13px] font-bold">{i18n.language === 'hi' ? 'नेत्र सोच रहा है...' : 'Thinking...'}</Text>
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
                    <Text className="text-slate-700 font-bold text-[12px]">{i18n.language === 'hi' ? action.title : action.title}</Text>
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
                placeholder={i18n.language === 'hi' ? "यहां टाइप करें..." : "Type your message..."}
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
