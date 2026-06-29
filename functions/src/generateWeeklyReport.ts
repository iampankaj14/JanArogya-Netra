import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

export const generateWeeklyReport = onSchedule('0 9 * * 1', async (event) => {
  const db = admin.firestore();

  try {
    // 1. Fetch telemetry summaries to generate data metrics
    const facilitiesSnap = await db.collection('facilities').get();
    const activeAlertsSnap = await db.collection('alerts').where('resolved', '==', false).get();
    const transfersSnap = await db.collection('transfers').get();

    const totalPHCs = facilitiesSnap.size;
    const activeAlertsCount = activeAlertsSnap.size;
    const totalTransfersCount = transfersSnap.size;

    // Calculate current week number
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), 0, 1);
    const days = Math.floor((currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startDate.getDay() + 1) / 7);

    // 2. Setup the report metadata
    const reportRef = db.collection('reports').doc();
    await reportRef.set({
      title: `Weekly Epidemiological Summary - Week ${weekNumber}`,
      type: 'Epidemiological',
      date: new Date().toISOString(),
      generatedBy: 'System AI',
      pdfUrl: `https://firebasestorage.googleapis.com/v0/b/project-id.appspot.com/o/reports%2Fweek-${weekNumber}.pdf`,
      summaryMetrics: {
        totalFacilitiesAudited: totalPHCs,
        activeAlertsAtCompilation: activeAlertsCount,
        completedRedistributions: totalTransfersCount,
      },
    });

    console.log(`Successfully generated and logged weekly report for Week ${weekNumber}`);
  } catch (error) {
    console.error('Error generating weekly report', error);
  }
});
