import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  async register(email: string, password: string, displayName: string) {
    return { user: { id: 'user_1', email, displayName }, accessToken: 'access-token', refreshToken: 'refresh-token' };
  }
  async login(email: string, password: string) {
    if (!email || !password) throw new UnauthorizedException();
    return { user: { id: 'user_1', email, displayName: 'User' }, accessToken: 'access-token', refreshToken: 'refresh-token' };
  }
  async refresh() { return { accessToken: 'access-token', refreshToken: 'refresh-token' }; }
  async logout() { return { success: true }; }
  async session() { return { user: { id: 'user_1', email: 'user@example.com', displayName: 'User' } }; }
}
