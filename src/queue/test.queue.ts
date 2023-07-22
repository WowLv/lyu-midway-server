import { Processor, IProcessor, Context } from '@midwayjs/bull';
import { Inject } from '@midwayjs/core';

@Processor('test')
export class TestProcessor implements IProcessor {
  @Inject()
  ctx: Context;

  sleep(timer: number) {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, timer);
    });
  }

  async execute(data: any) {
    console.log('---------------job--------------', this.ctx.job);
    let timer = 0;
    await this.sleep(1000);
    timer += 50;
    await this.ctx.job.progress(timer);
    await this.sleep(1000);
    timer += 50;
    await this.ctx.job.progress(timer);
    return `${data.name} finished!`;
  }
}
