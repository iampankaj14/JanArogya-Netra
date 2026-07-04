import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import ScreenContainer from '@/components/ui/layout/ScreenContainer';
import { dummyPHCs } from '@/dummy/phcs';
import { PHC } from '@/shared/types/phc';
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

function getStatusColor(status: FacilityStatus) {
  switch(status) {
    case 'Operational': return { core: '#10B981', bg: 'rgba(16,185,129,0.2)', sign: '+' };
    case 'Limited Services': return { core: '#3B82F6', bg: 'rgba(59,130,246,0.2)', sign: '+' };
    case 'Sub Center': return { core: '#F59E0B', bg: 'rgba(245,158,11,0.2)', sign: '+' };
    case 'Closed': return { core: '#EF4444', bg: 'rgba(239,68,68,0.2)', sign: '×' };
  }
}

export default function DistrictMapScreen() {
  const router = useRouter();
  const { authState } = useAuth();
  const isBMO = authState?.role === 'BMO';
  const assignedBlock = 'Dadri';

  const [search, setSearch] = useState('');
  const [isLegendExpanded, setIsLegendExpanded] = useState(true);

  // Filtered PHC markers
  const filteredPHCs = useMemo(() => {
    return dummyPHCs.filter(phc => {
      if (isBMO && phc.block !== assignedBlock) return false;
      return phc.name.toLowerCase().includes(search.toLowerCase()) ||
             phc.block.toLowerCase().includes(search.toLowerCase());
    }).map(phc => {
       const status = getFacilityStatus(phc);
       const colors = getStatusColor(status);
       return { ...phc, status, colors };
    });
  }, [isBMO, assignedBlock, search]);

  const leafletHTML = `
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
        
        function createIcon(phc) {
          var html = '<div class="custom-marker" style="background-color: ' + phc.colors.bg + '; width: 48px; height: 48px;">' +
                     '<div class="custom-marker-inner" style="background-color: ' + phc.colors.core + ';">' + phc.colors.sign + '</div>' +
                     '</div>';

          return L.divIcon({
            html: html,
            className: '',
            iconSize: [48, 48],
            iconAnchor: [24, 24],
            popupAnchor: [0, -24]
          });
        }

        phcs.forEach(function(phc) {
          var marker = L.marker([phc.latitude, phc.longitude], {icon: createIcon(phc)}).addTo(map);
          marker.bindPopup("<div style='font-family:sans-serif;text-align:center;'><b>" + phc.name + "</b><br><span style='color:#64748B;font-size:11px;'>" + phc.status + "</span></div>");
          
          marker.on('click', function() {
             setTimeout(function() {
                window.ReactNativeWebView.postMessage(phc.id);
             }, 300); // slight delay to allow popup to show before routing
          });
        });

        // Add custom zoom controls that react native will trigger (if needed)
        window.zoomIn = function() { map.zoomIn(); }
        window.zoomOut = function() { map.zoomOut(); }
        window.recenter = function() { map.setView([${USER_LOCATION.latitude}, ${USER_LOCATION.longitude}], 11); }
      </script>
    </body>
    </html>
  `;

  let webviewRef: any = null;

  return (
    <ScreenContainer scrollable={false} padding={false}>
      <View className="flex-1 relative bg-[#F1EFE9]">
        
        <WebView
          ref={(ref) => (webviewRef = ref)}
          source={{ html: leafletHTML }}
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

        {/* Top Search Bar */}
        <View className="absolute top-4 left-4 right-4 z-50 flex-row items-center space-x-3 pointer-events-none">
          <View className="flex-1 bg-white rounded-[24px] px-4 py-3.5 flex-row items-center shadow-sm border border-slate-100 pointer-events-auto">
            <Feather name="search" size={18} color="#94A3B8" className="mr-3" />
            <TextInput
              className="flex-1 text-slate-800 text-[15px] font-medium"
              placeholder="Search health centers, blocks..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* Legend Overlay with Toggle functionality */}
        <View className="absolute top-24 left-4 bg-white/95 rounded-[24px] p-5 shadow-md w-52 z-40 border border-slate-100">
          <Pressable 
            onPress={() => setIsLegendExpanded(!isLegendExpanded)}
            className="flex-row items-center justify-between"
          >
            <Text className="text-slate-900 font-bold text-sm">Legend</Text>
            <Feather name={isLegendExpanded ? "chevron-up" : "chevron-down"} size={18} color="#64748B" />
          </Pressable>
          
          {isLegendExpanded && (
            <View>
              <View className="space-y-3 mt-4 mb-5">
                <View className="flex-row items-center gap-3">
                  <View className="w-5 h-6 bg-[#10B981] rounded-l-full rounded-tr-full" />
                  <Text className="text-slate-600 font-medium text-xs">PHC (Operational)</Text>
                </View>
                <View className="flex-row items-center gap-3">
                  <View className="w-5 h-6 bg-[#3B82F6] rounded-l-full rounded-tr-full" />
                  <Text className="text-slate-600 font-medium text-xs">PHC (Limited Services)</Text>
                </View>
                <View className="flex-row items-center gap-3">
                  <View className="w-5 h-6 bg-[#F59E0B] rounded-l-full rounded-tr-full" />
                  <Text className="text-slate-600 font-medium text-xs">Sub Center</Text>
                </View>
                <View className="flex-row items-center gap-3">
                  <View className="w-5 h-6 bg-[#EF4444] rounded-l-full rounded-tr-full" />
                  <Text className="text-slate-600 font-medium text-xs">PHC (Closed)</Text>
                </View>
              </View>

              <View className="h-[1px] w-full bg-slate-100 mb-3" />
              
              <Text className="text-slate-500 font-medium text-xs mb-1">Total Facilities</Text>
              <Text className="text-[#208AEF] font-bold text-2xl">{filteredPHCs.length}</Text>
            </View>
          )}
        </View>

        {/* Map Controls */}
        <View className="absolute top-24 right-4 space-y-3 z-40">
          <Pressable 
            onPress={() => webviewRef?.injectJavaScript('window.recenter(); true;')}
            className="w-[52px] h-[52px] bg-white rounded-full items-center justify-center shadow-md border border-slate-50"
          >
            <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#208AEF" />
          </Pressable>
          <View className="bg-white rounded-full shadow-md border border-slate-50 overflow-hidden">
            <Pressable 
              onPress={() => webviewRef?.injectJavaScript('window.zoomIn(); true;')}
              className="w-12 h-12 items-center justify-center border-b border-slate-100 active:bg-slate-50"
            >
              <Feather name="plus" size={22} color="#64748B" />
            </Pressable>
            <Pressable 
              onPress={() => webviewRef?.injectJavaScript('window.zoomOut(); true;')}
              className="w-12 h-12 items-center justify-center active:bg-slate-50"
            >
              <Feather name="minus" size={22} color="#64748B" />
            </Pressable>
          </View>
        </View>

        {/* Navigation Arrow */}
        <View className="absolute bottom-6 right-4 z-40">
           <Pressable className="w-[52px] h-[52px] bg-white rounded-full items-center justify-center shadow-md border border-slate-50">
             <Feather name="navigation" size={24} color="#208AEF" style={{ transform: [{ rotate: '45deg' }], marginLeft: -2, marginTop: 2 }} />
           </Pressable>
        </View>

      </View>
    </ScreenContainer>
  );
}
