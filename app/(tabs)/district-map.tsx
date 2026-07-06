import ScreenContainer from '@/components/ui/layout/ScreenContainer';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleScopedPHCs } from '@/hooks/usePHCs';
import { PHC } from '@/shared/types/phc';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, Text, TextInput, View, TouchableOpacity, LayoutAnimation } from 'react-native';
import { WebView } from 'react-native-webview';

// Mock User Location (Center of Gautam Buddha Nagar)
const USER_LOCATION = { latitude: 28.4744, longitude: 77.5040 };

type FacilityStatus = 'Operational' | 'Limited Services' | 'Sub Center' | 'Closed';

function getFacilityStatus(phc: PHC): FacilityStatus {
  if (phc.healthScore < 60) return 'Closed';
  if (phc.bedsTotal <= 5) return 'Sub Center';
  if (phc.healthScore < 75) return 'Limited Services';
  return 'Operational';
}

function getStatusDetails(status: FacilityStatus) {
  switch (status) {
    case 'Operational':
      return { core: '#10B981', bg: 'rgba(16,185,129,0.2)', sign: '+', textClass: 'text-emerald-700', bgClass: 'bg-emerald-100', img: require('@/data/phc/phc illustration/green1.png') };
    case 'Limited Services':
      return { core: '#3B82F6', bg: 'rgba(59,130,246,0.2)', sign: '+', textClass: 'text-blue-700', bgClass: 'bg-blue-100', img: require('@/data/phc/phc illustration/green1.png') };
    case 'Sub Center':
      return { core: '#F59E0B', bg: 'rgba(245,158,11,0.2)', sign: '+', textClass: 'text-amber-700', bgClass: 'bg-amber-100', img: require('@/data/phc/phc illustration/yellow1.png') };
    case 'Closed':
      return { core: '#EF4444', bg: 'rgba(239,68,68,0.2)', sign: '×', textClass: 'text-red-700', bgClass: 'bg-red-100', img: require('@/data/phc/phc illustration/red1.png') };
  }
}

// Calculate distance mock
// Calculate distance mock
function getDistanceMock(phcId: string, t?: any): string {
  // Just deterministic mock based on id length or char code for visual variety
  const num = (phcId.charCodeAt(0) % 5) + 1 + (phcId.charCodeAt(1) % 10) / 10;
  const suffix = t ? t('mapKmAway') : 'km away';
  return `${num.toFixed(1)} ${suffix}`;
}

export default function DistrictMapScreen() {
  const router = useRouter();
  const { authState } = useAuth();
  const { t, language } = useTranslation();

  const { phcs: allPhcs } = useRoleScopedPHCs();

  const [search, setSearch] = useState('');
  const [isLegendExpanded, setIsLegendExpanded] = useState(true);

  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleTray = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsCollapsed(!isCollapsed);
  };

  // Filtered PHC markers (allPhcs is already role-scoped by useRoleScopedPHCs)
  const filteredPHCs = useMemo(() => {
    return allPhcs.filter(phc => {
      return phc.name.toLowerCase().includes(search.toLowerCase()) ||
        phc.block.toLowerCase().includes(search.toLowerCase());
    }).map(phc => {
      const status = getFacilityStatus(phc);
      const details = getStatusDetails(status);
      const translatedStatus = status === 'Operational' ? t('mapStatusOperational') :
                               status === 'Limited Services' ? t('mapStatusLimited') :
                               status === 'Sub Center' ? t('mapStatusSubCenter') : t('mapStatusClosed');
      return { ...phc, status: translatedStatus, colors: { core: details.core, bg: details.bg, sign: details.sign } };
    });
  }, [allPhcs, search]);

  const getMapHtml = () => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { padding: 0; margin: 0; }
        html, body, #map { height: 100%; width: 100vw; }
        .leaflet-control-attribution { display: none; }
        .custom-marker {
           display: flex;
           align-items: center;
           justify-content: center;
           border-radius: 50%;
           box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        .custom-marker-inner {
           width: 20px;
           height: 20px;
           border-radius: 50%;
           border: 2px solid white;
           display: flex;
           align-items: center;
           justify-content: center;
           color: white;
           font-size: 16px;
           font-weight: bold;
           font-family: sans-serif;
           line-height: 1;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: false }).setView([${USER_LOCATION.latitude}, ${USER_LOCATION.longitude}], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);

        var phcs = ${JSON.stringify(filteredPHCs)};
        
        function createIcon(phc, displayName) {
          var html = '<div style="display:flex; flex-direction:column; align-items:center;">' +
                     '<div class="custom-marker" style="background-color: ' + phc.colors.bg + '; width: 48px; height: 48px;">' +
                     '<div class="custom-marker-inner" style="background-color: ' + phc.colors.core + ';">' + phc.colors.sign + '</div>' +
                     '</div>' +
                     '<div style="background-color: rgba(255, 255, 255, 0.95); padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; margin-top: 4px; color: #1E293B; box-shadow: 0 2px 4px rgba(0,0,0,0.1); white-space: nowrap; border: 1px solid rgba(0,0,0,0.05);">' + displayName + '</div>' +
                     '</div>';

          return L.divIcon({
            html: html,
            className: '',
            iconSize: [48, 70],
            iconAnchor: [24, 24],
            popupAnchor: [0, -24]
          });
        }

        phcs.forEach(function(phc) {
          var displayName = phc.name;
          if ('${language}' === 'hi' && phc.nameHi) {
             displayName = phc.nameHi;
          }
          var marker = L.marker([phc.latitude, phc.longitude], {icon: createIcon(phc, displayName)}).addTo(map);
          marker.bindPopup("<div style='font-family:sans-serif;text-align:center;'><b>" + displayName + "</b><br><span style='color:#64748B;font-size:11px;'>" + phc.status + "</span></div>");
          
          marker.on('click', function() {
             setTimeout(function() {
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(phc.id);
                } else {
                  window.parent.postMessage({ type: 'PHC_CLICK', id: phc.id }, '*');
                }
             }, 300);
          });
        });

        window.zoomIn = function() { map.zoomIn(); }
        window.zoomOut = function() { map.zoomOut(); }
        window.recenter = function() { map.setView([${USER_LOCATION.latitude}, ${USER_LOCATION.longitude}], 11); }
        
        window.addEventListener('message', function(event) {
          if (event.data && event.data.type === 'ZOOM_IN') map.zoomIn();
          if (event.data && event.data.type === 'ZOOM_OUT') map.zoomOut();
          if (event.data && event.data.type === 'RECENTER') map.setView([${USER_LOCATION.latitude}, ${USER_LOCATION.longitude}], 11);
        });
      </script>
    </body>
    </html>
  `;

  let webviewRef: any = null;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'PHC_CLICK' && event.data.id) {
          router.push({ pathname: '/(tabs)/phc-detail', params: { id: event.data.id } });
        }
      };
      window.addEventListener('message', handleMessage as any);
      return () => window.removeEventListener('message', handleMessage as any);
    }
  }, [router]);

  const sendMapCommand = (command: string) => {
    if (Platform.OS === 'web' && iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({ type: command }, '*');
    } else if (webviewRef) {
      if (command === 'ZOOM_IN') webviewRef.injectJavaScript('window.zoomIn(); true;');
      else if (command === 'ZOOM_OUT') webviewRef.injectJavaScript('window.zoomOut(); true;');
      else if (command === 'RECENTER') webviewRef.injectJavaScript('window.recenter(); true;');
    }
  };

  return (
    <ScreenContainer scrollable={false} padding={false}>
      <View className="flex-1 relative bg-[#F1EFE9]">

        {Platform.OS === 'web' ? (
          <iframe
            ref={iframeRef as any}
            srcDoc={getMapHtml()}
            style={{ width: '100%', height: '100%', border: 'none', position: 'absolute' }}
            title="map"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        ) : (
          <WebView
            ref={(ref) => { webviewRef = ref; }}
            source={{ html: getMapHtml() }}
            style={{ flex: 1, width: '100%', height: '100%', position: 'absolute' }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            bounces={false}
            scrollEnabled={false}
            onMessage={(event) => {
              const phcId = event.nativeEvent.data;
              router.push({ pathname: '/(tabs)/phc-detail', params: { id: phcId } });
            }}
          />
        )}

        {/* Top Search Bar */}
        <View className="absolute top-4 left-4 right-4 z-50 flex-row items-center pointer-events-none">
          <View className="flex-1 bg-white rounded-full px-4 py-3 flex-row items-center shadow-sm border border-slate-100 pointer-events-auto">
            <Feather name="search" size={18} color="#94A3B8" className="mr-3" />
            <TextInput
              className="flex-1 text-slate-800 text-[14px] font-medium"
              placeholder={t('districtMapSearchPlaceholder')}
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* Map Controls */}
        <View className="absolute top-24 right-4 space-y-3 items-center z-40 mt-1">
          <Pressable
            onPress={() => sendMapCommand('RECENTER')}
            className="w-11 h-11 bg-white rounded-full items-center justify-center shadow-md border border-slate-50"
          >
            <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#208AEF" />
          </Pressable>
          <View className="bg-white rounded-full shadow-md border border-slate-50 overflow-hidden w-11">
            <Pressable
              onPress={() => sendMapCommand('ZOOM_IN')}
              className="w-11 h-11 items-center justify-center border-b border-slate-100 active:bg-slate-50"
            >
              <Feather name="plus" size={20} color="#64748B" />
            </Pressable>
            <Pressable
              onPress={() => sendMapCommand('ZOOM_OUT')}
              className="w-11 h-11 items-center justify-center active:bg-slate-50"
            >
              <Feather name="minus" size={20} color="#64748B" />
            </Pressable>
          </View>
        </View>

        {/* Nearby Facilities Bottom Tray */}
        <View style={{ position: 'absolute', bottom: 85, left: 0, right: 0, zIndex: 50 }}>
          <View className="bg-white rounded-t-3xl shadow-[0_-4px_15px_rgba(0,0,0,0.05)] pt-3">
            <Pressable onPress={toggleTray} className="pb-2">
                <View className="w-10 h-1 bg-slate-200 rounded-full self-center mb-4" />

                <View className="flex-row items-center justify-between px-5 mb-4">
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 rounded-full bg-rose-50 items-center justify-center border border-rose-100">
                      <MaterialCommunityIcons name="hospital-marker" size={16} color="#E11D48" />
                    </View>
                    <Text className="text-slate-800 font-extrabold text-lg ml-2.5">{t('districtMapNearbyFacilities')}</Text>
                  </View>
                  <Pressable 
                    className="bg-slate-800 px-3 py-1.5 rounded-full flex-row items-center border border-slate-700 shadow-sm"
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push('/(tabs)/phcs');
                    }}
                  >
                    <Text className="text-white font-bold text-[10px] uppercase tracking-wider mr-1">{t('districtMapViewAll')}</Text>
                    <Feather name="chevron-right" size={12} color="white" />
                  </Pressable>
                </View>
              </Pressable>

            {!isCollapsed && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 24 }}
              >
            {allPhcs.slice(0, 5).map((phc, idx) => {
              const status = getFacilityStatus(phc);
              const details = getStatusDetails(status);
              const translatedStatus = status === 'Operational' ? t('mapStatusOperational') :
                                       status === 'Limited Services' ? t('mapStatusLimited') :
                                       status === 'Sub Center' ? t('mapStatusSubCenter') : t('mapStatusClosed');
              const distance = getDistanceMock(phc.id, t);
              const translatedName = language === 'hi' && phc.nameHi ? phc.nameHi : phc.name;

              return (
                <Pressable
                  key={idx}
                  style={{ borderColor: details.core, borderWidth: 1.5 }}
                  className="w-36 bg-white rounded-[20px] overflow-hidden shadow-sm active:opacity-90"
                  onPress={() => router.push({ pathname: '/(tabs)/phc-detail', params: { id: phc.id } })}
                >
                  <View className="h-24 bg-slate-50 relative overflow-hidden items-center justify-center">
                    <Image source={details.img} className="w-[110px] h-[110px] opacity-90 mt-4" resizeMode="contain" />

                    {/* Status Badge Over Image */}
                    <View className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full items-center justify-center shadow-sm" style={{ backgroundColor: details.bg }}>
                      <View className="w-3 h-3 rounded-full items-center justify-center border-[1.5px] border-white" style={{ backgroundColor: details.core }}>
                        <Text className="text-white font-bold" style={{ fontSize: 8, lineHeight: 9 }}>{details.sign}</Text>
                      </View>
                    </View>
                  </View>

                  <View className="p-3 bg-white border-t border-slate-50">
                    <Text className="font-black text-slate-800 text-[13px] mb-1 tracking-tight" numberOfLines={1}>{translatedName}</Text>
                    <View className="flex-row items-center mb-2.5">
                      <Feather name="map-pin" size={10} color="#94A3B8" />
                      <Text className="text-[10px] text-slate-500 font-bold ml-1">{distance}</Text>
                    </View>

                    <View className={`self-start px-2 py-0.5 rounded-full border border-white/50 ${details.bgClass}`}>
                      <Text className={`font-black text-[9px] uppercase tracking-wider ${details.textClass}`}>{translatedStatus}</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
            )}
          </View>
        </View>

      </View>
    </ScreenContainer>
  );
}
