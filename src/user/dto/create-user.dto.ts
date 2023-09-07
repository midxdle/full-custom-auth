import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'User Email',
    example: 'test@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User Username',
    example: 'test',
  })
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'User Password',
    example: 'Test1234@',
  })
  @IsNotEmpty()
  password: string;
}
