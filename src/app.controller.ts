import {
  Body,
  Controller,
  Get,
  Post,
  Redirect,
  Render,
  Session,
} from '@nestjs/common';
import { AppService } from './app.service';
import db from './db';
import * as bcrypt from 'bcrypt';
import UserDataDto from './userdata.dto';
import session from 'express-session';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  async index(@Session() session: Record<string, any>) {
    let userName = '';
    if (session.user_id) {
      const [rows]: any = await db.execute(
        'SELECT username FROM users WHERE id = ?',
        [session.user_id],
      );
    } else {
      userName = 'Guest';
    }

    return { message: 'Welcome to the homepage, ' + userName };
  }

  @Get('/register')
  @Render('register')
  registerForm() {
    return {};
  }

  @Post('/register')
  @Redirect()
  async register(@Body() userdata: UserDataDto) {
    await db.execute('INSERT INTO users (username, password) VALUES (?, ?)', [
      userdata.username,
      await bcrypt.hash(userdata.password, 10),
    ]);
    return {
      url: '/',
    };
  }

  @Get('/login')
  @Render('login')
  loginForm() {
    return {};
  }

  @Post('/login')
  @Redirect()
  async login(
    @Body() userdata: UserDataDto,
    @Session() session: Record<string, any>,
  ) {
    const [rows]: any = await db.execute(
      'SELECT id, username, password FROM users WHERE username = ?',
      [userdata.username],
    );
    if (rows.length == 0) {
      return { url: '/login' };
    }
    if (await bcrypt.compare(userdata.password, rows[0].password)) {
      session.user_id = rows[0].ud;
      return { url: '/' };
    } else {
      return { url: '/login' };
    }
  }
}
