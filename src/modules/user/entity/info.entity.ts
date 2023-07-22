import { EntityModel } from '@midwayjs/orm';
import { Column } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

@EntityModel('user_info')
export class UserInfoEntity extends BaseEntity {
  @Column({ comment: '密码', length: 200 })
  password: string;

  @Column({ comment: '头像', nullable: true })
  avatarUrl: string;

  @Column({ comment: '用户名', nullable: true, length: 20 })
  userName: string;

  @Column({ comment: '手机号', nullable: true, length: 20 })
  phone: string;

  @Column({ comment: '权限 1-超级管理员 2-用户', default: 2 })
  authority: number;

  @Column({ comment: '部门ID', nullable: true })
  departmentId: string;

  @Column({ comment: '性别 0-未知 1-男 2-女', default: 0 })
  gender: number;

  @Column({ comment: '状态 0-禁用 1-正常', default: 1 })
  status: number;
}
