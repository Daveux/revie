var winston = require("winston");

const logger = new winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({format: 'MMM-DD-YYYY HH:mm:ss'}),
        winston.format.align(),
        winston.format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
    ),
    transports:
        [
            new winston.transports.File({
                filename: 'logs/server.log',
            }),
            new winston.transports.Console()
        ]
});

logger.info(`Logger successfully connected`);

module.exports = logger;
