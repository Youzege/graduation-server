import { AuthGuardLocal } from '../auth-guard.local'
import { Controller, Get, Logger, Post, UseGuards } from '@nestjs/common'
import { AuthService } from '../auth.service'
import { CurrentUser } from '../current-user.decorator'
import { User } from '../entity/user.entity'
import { AuthGuardJwt } from '../auth-guard.jwt'

@Controller('/api/user')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(AuthGuardLocal)
  async login(@CurrentUser() user: User) {
    return {
      userId: user.id,
      token: this.authService.getTokenForUser(user),
    }
  }

  @Get('profile')
  @UseGuards(AuthGuardJwt)
  async getProfile(@CurrentUser() user: User) {
    return user
  }
}
