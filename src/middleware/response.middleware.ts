import { Middleware, IMiddleware } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';

@Middleware()
export class ResponseMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const result = await next();
      return {
        code: result?.code ?? 200,
        success: true,
        msg: result.msg,
        data: result.data,
      };
    };
  }
}

@Middleware()
export class UserInfoFormatMiddleware
  implements IMiddleware<Context, NextFunction>
{
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const result = await next();
      const _data = result.data;
      if (Array.isArray(_data)) {
        _data.forEach(item => {
          delete item.password;
        });
      } else {
        delete _data.password;
      }
      return {
        code: result?.code ?? 200,
        success: true,
        msg: result.msg,
        data: _data,
      };
    };
  }

  match(ctx: Context): boolean {
    // 下面的匹配到的路由不执行此中间件
    const ignore = ctx.path.indexOf('/logout') !== -1;
    return !ignore;
  }
}
