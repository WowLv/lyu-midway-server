import { Rule, RuleType } from '@midwayjs/validate';

export class UserDTO {
  @Rule(RuleType.number())
  id: number;

  @Rule(RuleType.string().required())
  userName: string;

  @Rule(RuleType.string().required())
  password: string;

  @Rule(RuleType.string().required())
  phone: string;

  @Rule(RuleType.string())
  avatarUrl: string;

  @Rule(RuleType.number())
  gender: number;

  @Rule(RuleType.number())
  authority: number;

  @Rule(RuleType.string())
  departmentId: string;
}
