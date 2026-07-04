const fs = require('fs');

const path = 'app/(tabs)/resource-movement-tracker.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add searchedShipment state
content = content.replace(
  "const [shipments, setShipments] = useState<TransferOrder[]>([]);",
  "const [shipments, setShipments] = useState<TransferOrder[]>([]);\n  const [searchedShipment, setSearchedShipment] = useState<TransferOrder | null>(null);"
);

// 2. Update handleSearch
const oldHandleSearch = `  const handleSearch = () => {
    // In a real app, this would route to a detail screen for the specific tracking ID
    if (trackingId.trim()) {
      alert(\`Tracking details for \${trackingId} are loading...\`);
    }
  };`;

const newHandleSearch = `  const handleSearch = () => {
    if (trackingId.trim()) {
      const found = shipments.find(s => s.id === trackingId.trim());
      if (found) {
        setSearchedShipment(found);
      } else {
        alert(\`Tracking ID \${trackingId} not found.\`);
        setSearchedShipment(null);
      }
    }
  };`;
content = content.replace(oldHandleSearch, newHandleSearch);

// 3. Extract sections to reorder
const howItWorksStart = content.indexOf('{/* How It Works Section */}');
const whatYouCanTrackStart = content.indexOf('{/* What You Can Track Section */}');
const promoBannerStart = content.indexOf('{/* Promo Banner */}');
const recentShipmentsStart = content.indexOf('{/* Recent Shipments */}');
const scrollViewEnd = content.lastIndexOf('</ScrollView>');

if (howItWorksStart > -1 && recentShipmentsStart > -1) {
  const topPart = content.substring(0, howItWorksStart);
  const howItWorksToPromo = content.substring(howItWorksStart, recentShipmentsStart);
  const recentShipments = content.substring(recentShipmentsStart, scrollViewEnd);
  const bottomPart = content.substring(scrollViewEnd);

  const searchedShipmentUI = `
        {/* Searched Shipment Result */}
        {searchedShipment && (
          <View className="mb-6">
            <Text className="text-brand-navy font-black text-lg mb-4 px-1">Tracked Shipment</Text>
            <View className="bg-white border border-blue-200 rounded-2xl p-4 shadow-sm flex-row items-center mb-3">
              <View className={\`w-10 h-10 rounded-full items-center justify-center mr-3 \${searchedShipment.status === 'EN_ROUTE' ? 'bg-blue-100' : 'bg-emerald-100'}\`}>
                <Feather name={searchedShipment.status === 'EN_ROUTE' ? 'truck' : 'check'} size={18} color={searchedShipment.status === 'EN_ROUTE' ? '#3B82F6' : '#10B981'} />
              </View>
              <View className="flex-1">
                <Text className="text-brand-navy font-extrabold text-[13px] mb-0.5">{searchedShipment.id}: {searchedShipment.medicineName}</Text>
                <Text className="text-slate-500 font-semibold text-[10px]" numberOfLines={1}>
                  {searchedShipment.sourceFacilityId.replace('phc_', '').replace('chc_', '')} <Feather name="arrow-right" size={10} /> {searchedShipment.targetFacilityId.replace('phc_', '').replace('chc_', '')} ({searchedShipment.quantity} units)
                </Text>
              </View>
              <View className={\`px-2 py-1 rounded-md \${searchedShipment.status === 'EN_ROUTE' ? 'bg-blue-50 border border-blue-100' : 'bg-emerald-50 border border-emerald-100'}\`}>
                <Text className={\`font-bold text-[9px] \${searchedShipment.status === 'EN_ROUTE' ? 'text-blue-600' : 'text-emerald-600'}\`}>
                  {searchedShipment.status === 'EN_ROUTE' ? 'In Transit' : 'Delivered'}
                </Text>
              </View>
            </View>
          </View>
        )}

`;

  const reordered = topPart + searchedShipmentUI + recentShipments + howItWorksToPromo + bottomPart;
  fs.writeFileSync(path, reordered);
  console.log("Tracker successfully updated.");
} else {
  console.log("Could not find sections");
}

