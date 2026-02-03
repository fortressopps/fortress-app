
import { processReceipt } from "../src/modules/supermarket/application/process-receipt.usecase";
import { initPrisma } from "../src/libs/prisma";

async function debug() {
    console.log("Starting Debug...");
    try {
        const result = await processReceipt({
            userId: "debug-user",
            totalAmount: 12550,
            category: "Mercado",
            projectedMonthTotal: 200000,
            monthAverageScale: 10000
        });
        console.log("RESULT:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("DEBUG CRASH:", e);
    }
}

debug();
