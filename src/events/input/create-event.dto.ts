import { IsDateString, IsString, Length } from 'class-validator'

export class CreateEventDto {
  @IsString()
  @Length(5, 255, {
    message: '请输入5至255字符',
  })
  name: 'string'
  @Length(5, 255, {
    message: '请输入5至255字符',
  })
  description: 'string'
  @IsDateString()
  when: 'string'
  @Length(5, 255)
  address: 'string'
}
