import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async registerUser(data: any) {
    const { name, email, password } = data;
    
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('E-mail já está em uso.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return { id: user.id, name: user.name, email: user.email };
  }

  async loginUser(data: any) {
    const { email, password } = data;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const token = this.jwtService.sign({ id: user.id, name: user.name, email: user.email, role: user.role });

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    };
  }
}
