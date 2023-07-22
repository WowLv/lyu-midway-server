import { Provide } from '@midwayjs/core';

import { UserInfoEntity } from '../entity/info.entity';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';
import { BaseService } from '../../../common/base.service';
import { UserDTO } from '../dto/user.dto';
import { Inject } from '@midwayjs/core';
import { SnowflakeIdGenerate } from '../../../utils/Snowflake';

@Provide()
export class UserService extends BaseService<UserInfoEntity> {
  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  @Inject('idGenerate')
  keyGenerate: SnowflakeIdGenerate;

  getModel(): Repository<UserInfoEntity> {
    return this.userInfoEntity;
  }

  /**
   * @description: 查询用户
   * @param {any} options
   * @return {*}
   */
  async findUserBy(options: any) {
    return await this.userInfoEntity.find(options);
  }

  async login(payload: Partial<UserDTO>) {
    return await this.userInfoEntity.findOne({
      where: {
        userName: payload.userName,
        password: payload.password,
        status: 1,
      },
    });
  }

  /**
   * @description: 注册用户
   * @param {UserDTO} userInfo
   * @return {*}
   */
  async registerUser(userInfo: UserDTO) {
    userInfo.id = this.keyGenerate.generate();
    return await this.userInfoEntity.save(userInfo);
  }

  /**
   * @description: 软删除用户
   * @param {number} id
   * @return {*}
   */
  async deleteUser(id: number) {
    return await this.userInfoEntity
      .createQueryBuilder()
      .update()
      .set({ status: 0 })
      .where({ id, status: 1 })
      .execute();
  }
}
