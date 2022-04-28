import { CurrentUser } from './../current-user.decorator'
import { AuthService } from '../auth.service'
import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { CreateUserDto } from '../input/create.user.dto'
import { User } from '../entity/user.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UpdateUserProfileDto } from '../input/update.user.dto'
import { AuthGuardJwt } from '../auth-guard.jwt'

@Controller('/api/user-profile')
export class UsersController {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = new User()

    if (createUserDto.password !== createUserDto.retypedPassword) {
      throw new BadRequestException(['输入密码不一致!'])
    }

    const existingUser = await this.userRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    })

    if (existingUser) {
      throw new BadRequestException(['用户名或邮箱已经存在!'])
    }

    user.username = createUserDto.username
    user.password = await this.authService.hashPassword(createUserDto.password)
    user.email = createUserDto.email
    user.nickName = createUserDto.nickName
    user.imgUrl = createUserDto.imgUrl

    return {
      ...(await this.userRepository.save(user)),
      token: this.authService.getTokenForUser(user),
    }
  }

  @Patch(':id')
  @UseGuards(AuthGuardJwt)
  async update(
    @CurrentUser() user: User,
    @Param('id') id,
    @Body() input: UpdateUserProfileDto,
  ) {
    const event = await this.userRepository.findOne(id)

    if (!event) {
      throw new NotFoundException()
    }

    await this.userRepository.save({
      ...event,
      ...input,
    })

    return { ...event, ...input }
  }
}
