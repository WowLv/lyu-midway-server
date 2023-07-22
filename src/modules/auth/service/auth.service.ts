import { JwtService } from '@midwayjs/jwt';
import { Provide, Inject } from '@midwayjs/core';
import { UserInfoEntity } from '../../user/entity/info.entity';

@Provide()
export class AuthService {
  @Inject()
  jwtService: JwtService;

  // 生成token
  async createToken(user: Partial<UserInfoEntity>) {
    return await this.jwtService.sign({
      id: user.id,
      userName: user.userName,
    });
  }
}
