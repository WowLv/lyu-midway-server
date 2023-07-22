import {
  Inject,
  Controller,
  Post,
  Get,
  Query,
  Body,
  Del,
  httpError,
} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { AuthService } from '../../auth/service/auth.service';
import { UserInfoFormatMiddleware } from '../../../middleware/response.middleware';
import { IALLResult } from '../../../interface';
import { UserDTO } from '../dto/user.dto';

@Controller('/', { middleware: [UserInfoFormatMiddleware] })
export class APIController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Inject()
  authService: AuthService;

  @Get('/user')
  async getUser(@Query('id') id: number): Promise<IALLResult> {
    const user = await this.userService.findOneById(id);
    console.log('user', user);
    return { msg: '查询成功', data: user };
  }

  @Post('/login')
  async logon(
    @Body('userName') userName: string,
    @Body('password') password: string
  ) {
    const existUser = await this.userService.findUserBy({
      where: { userName, status: 1 },
    });
    if (existUser?.length) {
      const passUser = await this.userService.login({ userName, password });
      if (passUser) {
        delete passUser.password;
        const token = await this.authService.createToken(passUser);
        return { msg: '登录', data: { user: passUser, token } };
      } else {
        throw new httpError.BadRequestError('密码错误');
      }
    } else {
      throw new httpError.BadRequestError('用户名不存在');
    }
  }

  @Post('/register')
  async register(
    @Body() body: UserDTO,
    @Body('userName') userName: string,
    @Body('phone') phone: string
  ): Promise<IALLResult> {
    const existUser = await this.userService.findUserBy({
      where: [
        { userName: userName, status: 1 },
        { phone: phone, status: 1 },
      ],
    });
    if (existUser?.length) {
      if (existUser.some(i => i.userName === userName)) {
        throw new httpError.BadRequestError('该用户已注册');
      }
      if (existUser.some(i => i.phone === phone)) {
        throw new httpError.BadRequestError('该号码已注册');
      }
      throw new httpError.BadRequestError('该用户已注册');
    } else {
      const user = await this.userService.registerUser(body);
      return { msg: '注册成功', data: user };
    }
  }

  @Del('/user')
  async deleteUser(@Query('id') id: number): Promise<IALLResult> {
    const existUser = await this.userService.findUserBy({
      where: { id, status: 1 },
    });
    if (existUser?.length) {
      const res = await this.userService.deleteUser(id);
      if (res.affected > 0) {
        return { msg: '删除成功' };
      } else {
        throw new httpError.BadRequestError('删除失败');
      }
    } else {
      throw new httpError.BadRequestError('该用户不存在');
    }
  }
}