import { Inject, Controller, Post, httpError } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { AuthService } from '../service/auth.service';
import { JwtService } from '@midwayjs/jwt';
import { RedisService } from '@midwayjs/redis';
import { UserInfoEntity } from '../../user/entity/info.entity';

@Controller('/auth')
export class APIController {
  @Inject()
  ctx: Context;

  @Inject()
  jwtService: JwtService;

  @Inject()
  authService: AuthService;

  @Inject()
  redisService: RedisService;

  @Post('/refresh')
  async refresh() {
    const refreshToken = this.ctx.cookies.get('refresh_token');
    const accessToken = this.ctx.cookies.get('access_token');

    const isLose = await this.redisService.get(
      `black-list-token:${refreshToken}`
    );
    if (isLose) {
      throw new httpError.UnauthorizedError();
    } else {
      const refreshTokenInfo = await this.jwtService.decode(refreshToken);
      if (refreshTokenInfo) {
        delete refreshTokenInfo['exp'];
        delete refreshTokenInfo['iat'];
        const newToken = await this.authService.createToken(
          refreshTokenInfo as Partial<UserInfoEntity>,
          {
            expiresIn: 60 * 30,
          }
        );

        const existCache = await this.redisService.get(`token:${accessToken}`);
        if (existCache) {
          await this.redisService.del(`token:${accessToken}`);
        }
        await this.redisService.set(
          `token:${newToken}`,
          JSON.stringify(refreshTokenInfo),
          'EX',
          60 * 30
        );

        this.ctx.cookies.set('refresh_token', refreshToken);
        this.ctx.cookies.set('access_token', newToken);
        return {
          msg: '刷新成功',
          data: {
            access_token: newToken,
          },
        };
      } else {
        throw new httpError.UnauthorizedError();
      }
    }
  }
}
