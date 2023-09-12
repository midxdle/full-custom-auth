import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
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
  usernmae: string;

  @ApiProperty({
    description: 'User Password',
    example: 'Test1234@',
  })
  @IsNotEmpty()
  password: string;
}
