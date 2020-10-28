import pino from "pino";

const baseLogger = pino({
  ...{
    prettyPrint: process.env.NODE_ENV !== "production",
    timestamp: true,
    messageKey: "message",
    base: null,
    formatters: {
      level(label) {
        return {
          level: label,
        };
      },
    },
  },
});

export const logger = baseLogger.child({ level: process.env.NODE_ENV === "production" ? "warn" : "debug" });
