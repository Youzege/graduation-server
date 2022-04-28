import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { InjectRepository } from '@nestjs/typeorm'
import { Strategy } from 'passport-local'
import { Repository } from 'typeorm'
import { User } from './entity/user.entity'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name)

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super()
  }

  public async validate(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { username },
    })

    if (!user) {
      this.logger.debug(`用户 ${username} 未找到!`)
      throw new UnauthorizedException()
    }

    if (!(await bcrypt.compare(password, user.password))) {
      this.logger.debug(`用户 ${username} 密码不正确!`)
      throw new UnauthorizedException()
    }

    return user
  }
}
