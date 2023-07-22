import { Catch } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Catch()
export class DefaultErrorFilter {
  async catch(err: any, ctx: Context) {
    // 所有的未分类错误会到这里
    return {
      code: err.status,
      success: false,
      msg: err.message,
    };
  }
}
