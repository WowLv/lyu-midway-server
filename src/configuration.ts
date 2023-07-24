import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import * as orm from '@midwayjs/orm';
// import * as bull from '@midwayjs/bull'; // 基于redis的任务队列
import * as jwt from '@midwayjs/jwt';
import * as redis from '@midwayjs/redis';
import { join } from 'path';
import { DefaultErrorFilter } from './filter/default.filter';
// import { NotFoundFilter } from './filter/notfound.filter';
import { ReportMiddleware } from './middleware/report.middleware';
import { ResponseMiddleware } from './middleware/response.middleware';
import { JwtMiddleware } from './middleware/jwt.middleware';

@Configuration({
  imports: [
    orm,
    koa,
    validate,
    // bull,
    jwt,
    redis,
    {
      component: info,
      enabledEnvironment: ['local'],
    },
  ],
  importConfigs: [join(__dirname, './config')],
})
export class ContainerLifeCycle {
  @App()
  app: koa.Application;

  // @Inject()
  // bullFramework: bull.Framework;

  async onReady() {
    // add middleware
    this.app.useMiddleware([
      ReportMiddleware,
      ResponseMiddleware,
      JwtMiddleware,
    ]);
    // add filter
    this.app.useFilter([DefaultErrorFilter]);
  }

  async onServerReady() {
    // 任务队列执行
    // const testQueue = this.bullFramework.getQueue('test');
    // testQueue.on('progress', (job, progress) => {
    //   console.log(`Job ${job.id} is ${progress}% ready!`);
    // });
    // testQueue.on('completed', (job, result) => {
    //   console.log(`Job ${job.id} completed! Result: ${result}`);
    // });
    // await testQueue?.runJob({
    //   name: 'lyu project',
    // });
  }
}
