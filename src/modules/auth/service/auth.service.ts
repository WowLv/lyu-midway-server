import { JwtService } from '@midwayjs/jwt';
import { Provide, Inject } from '@midwayjs/core';
import { UserInfoEntity } from '../../user/entity/info.entity';

interface IPayload {
  access_token?: string;
  refresh_token?: string;
}

@Provide()
export class AuthService {
  @Inject()
  jwtService: JwtService;

  // 生成token
  async createToken(
    payload: Partial<UserInfoEntity> & IPayload,
    options?: any
  ) {
    return await this.jwtService.sign(
      {
        ...payload,
      },
      'secret',
      options
    );
  }
}
