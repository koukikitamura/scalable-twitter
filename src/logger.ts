import * as winston from "winston";

export const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: "debug",
    }),
  ],
});
