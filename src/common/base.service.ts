import { In, Repository } from 'typeorm';
import { BaseEntity } from './base.entity';
// import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { SnowflakeIdGenerate } from '../utils/Snowflake';
import { Inject } from '@midwayjs/core';

export abstract class BaseService<T extends BaseEntity> {
  abstract getModel(): Repository<T>;

  @Inject('idGenerate')
  keyGenerate: SnowflakeIdGenerate;

  async save(o: T) {
    // const keyGenerate = new SnowflakeIdGenerate();
    if (!o.id) o.id = this.keyGenerate.generate();
    return this.getModel().save(o);
  }

  async findOneById(id: number): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.getModel().findOneBy({ id });
  }

  async findByIds(ids: number[]): Promise<T[]> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.getModel().findBy({ id: In(ids) });
  }
}
