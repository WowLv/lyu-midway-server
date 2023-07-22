import { Provide } from '@midwayjs/core';

/**
 * Snowflake主键生成算法
 * 完整的算法是生成的ID长度为20位
 * 但是由于js最大值9007199254740991，再多就会溢出，再多要特殊处理。
 * 所以这里设置长度为16位id。将数据中心位调小到1位，将服务器位调小到1位，将序列位调小到10位
 * 这意味着最多支持两个数据中心，每个数据中心最多支持两台服务器
 */
@Provide('idGenerate')
export class SnowflakeIdGenerate {
  private twepoch = 0;
  private workerIdBits = 1;
  private dataCenterIdBits = 1;
  private maxWrokerId = -1 ^ (-1 << this.workerIdBits); // 值为：1
  private maxDataCenterId = -1 ^ (-1 << this.dataCenterIdBits); // 值为：1
  private sequenceBits = 10;
  private workerIdShift = this.sequenceBits; // 值为：10
  private dataCenterIdShift = this.sequenceBits + this.workerIdBits; // 值为：11
  // private timestampLeftShift =
  //   this.sequenceBits + this.workerIdBits + this.dataCenterIdBits; // 值为：12
  private sequenceMask = -1 ^ (-1 << this.sequenceBits); // 值为：4095
  private lastTimestamp = -1;
  private workerId = 1; //设置默认值,从环境变量取
  private dataCenterId = 1;
  private sequence = 0;

  constructor(_workerId = 0, _dataCenterId = 0, _sequence = 0) {
    if (this.workerId > this.maxWrokerId || this.workerId < 0) {
      throw new Error(
        'config.worker_id must max than 0 and small than maxWrokerId-[' +
          this.maxWrokerId +
          ']'
      );
    }
    if (this.dataCenterId > this.maxDataCenterId || this.dataCenterId < 0) {
      throw new Error(
        'config.data_center_id must max than 0 and small than maxDataCenterId-[' +
          this.maxDataCenterId +
          ']'
      );
    }
    this.workerId = _workerId;
    this.dataCenterId = _dataCenterId;
    this.sequence = _sequence;
  }

  private timeGen = (): number => {
    return Date.now();
  };

  private tilNextMillis = (lastTimestamp): number => {
    let timestamp = this.timeGen();
    while (timestamp <= lastTimestamp) {
      timestamp = this.timeGen();
    }
    return timestamp;
  };

  private nextId = (): number => {
    let timestamp: number = this.timeGen();
    if (timestamp < this.lastTimestamp) {
      throw new Error(
        'Clock moved backwards. Refusing to generate id for ' +
          (this.lastTimestamp - timestamp)
      );
    }
    if (this.lastTimestamp === timestamp) {
      this.sequence = (this.sequence + 1) & this.sequenceMask;
      if (this.sequence === 0) {
        timestamp = this.tilNextMillis(this.lastTimestamp);
      }
    } else {
      this.sequence = 0;
    }
    this.lastTimestamp = timestamp;
    // js 最大值 9007199254740991，再多就会溢出
    // 超过 32 位长度，做位运算会溢出，变成负数，所以这里直接做乘法，乘法会扩大存储
    const timestampPos = (timestamp - this.twepoch) * 4096;
    const dataCenterPos = this.dataCenterId << this.dataCenterIdShift;
    const workerPos = this.workerId << this.workerIdShift;
    return timestampPos + dataCenterPos + workerPos + this.sequence;
  };

  generate = (): number => {
    return this.nextId();
  };
}
