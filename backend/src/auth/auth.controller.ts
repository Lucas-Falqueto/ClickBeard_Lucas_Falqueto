import { Controller, Post, Get, Body, Res, Req, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from './guards/auth.guard';

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
  @ApiOperation({ summary: 'Autentica um usuário e seta cookie HttpOnly com o JWT' })
  @ApiResponse({ status: 200, description: 'Login bem-sucedido' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.loginUser(dto);

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    });

    return { user: result.user };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Encerra a sessão limpando o cookie' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
    return { message: 'Logout realizado com sucesso' };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Retorna os dados do usuário autenticado pelo cookie' })
  async me(@Req() req: Request) {
    const user = (req as any).user;
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
