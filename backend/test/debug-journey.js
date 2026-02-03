
import { processReceipt } from "../src/modules/supermarket/application/process-receipt.usecase.js";

async function debug() {
    console.log("🚀 Starting Standalone Debug...");
    try {
        const result = await processReceipt({
            userId: "00000000-0000-0000-0000-000000000001",
            totalAmount: 12550,
            category: "Mercado",
            projectedMonthTotal: 200000,
            monthAverageScale: 10000
        });
        console.log("SUCCESS ✅");
        console.log("RESULT:", JSON.stringify(result, null, 2));
    } catch (e: any) {
        console.error("CRASH ❌");
        console.error("Error Message:", e.message);
        console.error("Stack Trace:", e.stack);
    }
}

debug();
