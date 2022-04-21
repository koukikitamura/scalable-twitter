export const config = {
  DatabaseTableName: `twitter`,
  snowflakeWorkerId:
    parseInt(process.env["SNOWFLAKE_WORKER_ID"] as string) || 1,
};
