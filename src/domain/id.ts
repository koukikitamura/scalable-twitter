import { config } from "@src/config";
import { dateToUnixTime } from "./time";

const workerIDBits = 10;
const sequenceBits = 12;

// Use snowflake
// See: https://blog.twitter.com/engineering/en_us/a/2010/announcing-snowflake
export class IdGenerator {
  private workerId: number;
  private lastGenerateAt: number;
  private sequence: number;

  constructor(workerId?: number) {
    this.workerId = config.snowflakeWorkerId;
    this.lastGenerateAt = dateToUnixTime(new Date());
    this.sequence = 0;
  }
  generate(): number {
    const now = dateToUnixTime(new Date());

    if (now == this.lastGenerateAt) {
      this.sequence++;
    } else {
      this.sequence = 0;
    }
    this.lastGenerateAt = now;

    // The bit operators ('<<' and '|' ) can handle numbers within
    // the range of signed 32 bit integer.
    return (
      now * 2 ** (workerIDBits + sequenceBits) +
      this.workerId * 2 ** sequenceBits +
      this.sequence
    );
  }
}
