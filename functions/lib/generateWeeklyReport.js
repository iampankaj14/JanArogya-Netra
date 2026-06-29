"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWeeklyReport = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const admin = __importStar(require("firebase-admin"));
if (admin.apps.length === 0) {
    admin.initializeApp();
}
exports.generateWeeklyReport = (0, scheduler_1.onSchedule)('0 9 * * 1', async (event) => {
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
    }
    catch (error) {
        console.error('Error generating weekly report', error);
    }
});
//# sourceMappingURL=generateWeeklyReport.js.map