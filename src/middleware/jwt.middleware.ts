import { Inject, Middleware, httpError } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';
import { JwtService } from '@midwayjs/jwt';
import { AuthService } from '../modules/auth/service/auth.service';
import { RedisService } from '@midwayjs/redis';

@Middleware()
export class JwtMiddleware {
  @Inject()
  jwtService: JwtService;

  @Inject()
  redisService: RedisService;

  @Inject()
  authService: AuthService;

  public static getName(): string {
    return 'jwt';
  }

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // 判断下有没有校验信息
      if (!ctx.headers['authorization']) {
        throw new httpError.UnauthorizedError();
      }
      // 从 header 上获取校验信息
      const parts = ctx.get('authorization').trim().split(' ');

      if (parts.length !== 2) {
        throw new httpError.UnauthorizedError();
      }

      const [scheme, token] = parts;

      if (/^Bearer$/i.test(scheme)) {
        try {
          const cacheToken = await this.redisService.get(`token:${token}`);

          if (!cacheToken) {
            throw new httpError.UnauthorizedError();
          } else {
            console.log('access_token与redis缓存的token相同，仍在登录有效期内');
          }
        } catch (error) {
          console.log(error);

          throw new httpError.UnauthorizedError();
        }
        await next();
      }
    };
  }

  // 配置忽略鉴权的路由地址
  public match(ctx: Context): boolean {
    const ignore =
      ctx.path.indexOf('/login') !== -1 ||
      ctx.path.indexOf('/register') !== -1 ||
      ctx.path.indexOf('/auth/refresh') !== -1;
    return !ignore;
  }
}
