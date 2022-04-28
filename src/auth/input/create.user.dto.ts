import { IsEmail, IsUrl, Length } from 'class-validator'

export class CreateUserDto {
  @Length(2, 10, { message: '用户名长度为2至6个字符' })
  username: string
  @Length(6, 12, { message: '密码长度为6至12个字符' })
  password: string
  @Length(6, 12)
  retypedPassword: string
  @Length(1, 10, { message: '昵称长度为1至6个字符' })
  nickName: string
  @IsEmail()
  email: string
  @IsUrl()
  imgUrl: string
}
