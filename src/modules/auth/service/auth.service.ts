import { JwtService } from '@midwayjs/jwt';
import { Provide, Inject, Scope } from '@midwayjs/core';
import { ScopeEnum } from '@midwayjs/decorator';
import { UserInfoEntity } from '../../user/entity/info.entity';

interface IPayload {
  access_token?: string;
  refresh_token?: string;
}

@Provide()
@Scope(ScopeEnum.Request, { allowDowngrade: true })
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
      'lyu-midway-server',
      options
    );
  }
}
