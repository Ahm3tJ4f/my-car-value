import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { scrypt as _scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signUp(email: string, password: string) {
    const users = await this.usersService.find(email);

    if (users.length) {
      throw new HttpException('user already exist', HttpStatus.CONFLICT);
    }

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const hashedPassword = salt + '.' + hash.toString('hex');

    const user = await this.usersService.create(email, hashedPassword);
    return user;
  }

  async signIn(email: string, password: string) {
    const [user] = await this.usersService.find(email);

    if (!user) {
      throw new HttpException('user not found', HttpStatus.NOT_FOUND);
    }

    const [salt, hashedPassword] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (hashedPassword !== hash.toString('hex')) {
      throw new HttpException('bad password', HttpStatus.BAD_REQUEST);
    }

    return user;
  }
}
