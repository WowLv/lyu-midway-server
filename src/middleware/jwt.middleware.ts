import { Inject, Middleware, httpError } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';
import { JwtService } from '@midwayjs/jwt';
import { AuthService } from '../modules/auth/service/auth.service';
import { RedisService } from '@midwayjs/redis';
import { UserInfoEntity } from '../modules/user/entity/info.entity';

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
          const uid = ctx.cookies.get('_id', {
            encrypt: true,
          });
          const cacheToken = await this.redisService.get(uid);
          if (!cacheToken || cacheToken !== token) {
            const tokenUserInfo = await this.jwtService.decode(token);
            if (tokenUserInfo?.['refresh_token']) {
              const refreshTokenInfo = await this.jwtService.decode(
                tokenUserInfo['refresh_token']
              );
              if (refreshTokenInfo) {
                console.log('refresh_token未过期，续期access_token');

                const newToken = await this.authService.createToken(
                  {
                    ...(refreshTokenInfo as Partial<UserInfoEntity>),
                    refresh_token: tokenUserInfo['refresh_token'],
                  },
                  {
                    expiresIn: 60 * 30,
                  }
                );

                if (cacheToken) {
                  await this.redisService.del(uid);
                  console.log('重新登录 重新缓存redis');
                }
                await this.redisService.set(uid, newToken, 'EX', 60 * 30);
                ctx.cookies.set('_token', newToken);
              } else {
                throw new httpError.UnauthorizedError();
              }
            }
          }
          console.log('redis缓存token');
        } catch (error) {
          //token过期 生成新的token
          // const newToken = getToken(user);
          //将新token放入Authorization中返回给前端
          // ctx.set('Authorization', newToken);
          throw new httpError.UnauthorizedError();
        }
        await next();
      }
    };
  }

  // 配置忽略鉴权的路由地址
  public match(ctx: Context): boolean {
    const ignore =
      ctx.path.indexOf('/login') !== -1 || ctx.path.indexOf('/register') !== -1;
    return !ignore;
  }
}
