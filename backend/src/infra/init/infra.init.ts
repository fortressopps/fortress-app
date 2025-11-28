import prisma from "../prisma/prisma.client.js";
import { logger } from "../../config/logger/logger.config.js";
export async function initInfra(){
  try {
    await prisma.$connect();
    logger.info("Prisma connected");
  } catch(e){
    logger.error({err:e}, "Prisma connect failed");
    throw e;
  }
}
