const fs = require('fs');
let file = 'app/(tabs)/phc-detail.tsx';
let content = fs.readFileSync(file, 'utf8');

// Update MetricCard to use border-2
content = content.replace(/className=\\{\`rounded-3xl p-4 shadow-sm border \\$\\{borderColor\\} w-\\[48\\%\\] mb-3\`\\}/g, 
  'className={`rounded-3xl p-4 shadow-sm border-2 ${borderColor} w-[48%] mb-3`}');

// Extract the grid code
const start = content.indexOf('{/* KEY METRICS GRID */}');
const end = content.indexOf('{/* MEDICINE STOCK OVERVIEW */}');

const metricsGridReplacement = `{/* KEY METRICS GRID */}
        <View className="px-4 mb-4 flex-row flex-wrap justify-between">
          {[
            {
              id: 'footfall',
              title: t('phcDetailMetricFootfallToday'),
              value: todayFootfall.toString(),
              icon: 'account-group',
              iconBg: 'bg-purple-500',
              trend: footfallTrend,
              trendVal: \`\${footfallPct}%\`,
              subtitle: t('phcDetailMetricSubtitleVsYesterday'),
              borderColor: 'border-purple-200',
              bgColor: '#F3E8FF'
            },
            {
              id: 'beds',
              title: t('phcDetailMetricBedsAvailable'),
              value: \`\${bedsAvailable} / \${phc.bedsTotal}\`,
              icon: 'bed-empty',
              iconBg: 'bg-emerald-500',
              subtitle: \`\${bedsOccupiedPct}\${t('phcDetailMetricOccupiedSuffix')}\`,
              borderColor: 'border-emerald-200',
              bgColor: '#D1FAE5'
            },
            {
              id: 'staff',
              title: t('phcDetailStaffPresentLabel'),
              value: \`\${phc.staffPresent} / \${phc.staffTotal}\`,
              icon: 'account-group',
              iconBg: 'bg-amber-500',
              subtitle: \`\${staffAbsent} \${t('phcDetailAbsentTodaySuffix')}\`,
              borderColor: 'border-amber-200',
              bgColor: '#FEF3C7'
            },
            {
              id: 'rooms',
              title: t('phcDetailMetricConsultRooms'),
              value: phc.consultRooms.toString(),
              icon: 'doctor',
              iconBg: 'bg-purple-400',
              borderColor: 'border-purple-200',
              bgColor: '#F3E8FF'
            },
            {
              id: 'labs',
              title: t('phcDetailMetricLabServices'),
              value: t('phcDetailMetricLabServicesValue'),
              icon: 'flask',
              iconBg: 'bg-blue-400',
              borderColor: 'border-blue-200',
              bgColor: '#DBEAFE'
            }
          ].map(metric => (
            <MetricCard key={metric.id} {...metric} />
          ))}
        </View>

        `;

content = content.substring(0, start) + metricsGridReplacement + content.substring(end);

fs.writeFileSync(file, content);
console.log('Metrics Grid updated to map loop and border-2');
