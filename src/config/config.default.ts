import { MidwayConfig } from '@midwayjs/core';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1689643655569_8006',
  koa: {
    port: 7001,
  },
  orm: {
    type: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    username: 'root',
    password: '123456',
    database: 'midway_boot',
    synchronize: true, // 如果第一次使用，不存在表，有同步的需求可以写 true
    logging: true,
  },
  // bull: {
  //   defaultQueueOptions: {
  //     redis: 'redis://127.0.0.1:6379',
  //     removeOnComplete: 3, // 成功后移除任务记录，最多保留最近 3 条记录
  //     removeOnFail: 10, // 失败后移除任务记录
  //   },
  // },
  jwt: {
    secret: 'lyu-midway-server', // fs.readFileSync('xxxxx.key')
    expiresIn: '3d',
  },
  redis: {
    client: {
      port: 6379, // Redis port
      host: '127.0.0.1', // Redis host
      db: 0,
    },
  },
} as MidwayConfig;
