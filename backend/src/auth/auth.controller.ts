import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registra um novo usuário cliente' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.registerUser(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Autentica um usuário' })
  @ApiResponse({ status: 200, description: 'Login bem-sucedido retornando Token JWT' })
  async login(@Body() dto: LoginDto) {
    return this.authService.loginUser(dto);
  }
}
