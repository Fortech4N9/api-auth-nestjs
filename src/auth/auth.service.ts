import {BadRequestException, Injectable, ForbiddenException} from '@nestjs/common';
import {PrismaService} from "../../prisma/prisma.service";
import {AuthDto} from "./dto/auth.dto";
import * as bcrypt from 'bcrypt';
import {JwtService} from '@nestjs/jwt';
import {jwtSecret} from '../utils/constants';
import {Request, Response} from "express";

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwt: JwtService) {
    }

    async signup(dto: AuthDto) {
        const {email, password} = dto;

        const foundUser = await this.prisma.user.findUnique({where: {email: email}});

        if (foundUser) {
            throw new BadRequestException('Email already exists');
        }

        const hashedPassword = await this.hashPassword(password);

        await this.prisma.user.create({
            data: {
                email,
                hashedPassword
            }
        });

        return {message: 'signup was successfully'};
    }

    async signin(dto: AuthDto, req: Request, res: Response) {
        const {email, password} = dto;

        const foundUser = await this.prisma.user.findUnique({where: {email: email}});

        if (!foundUser) {
            throw new BadRequestException('Wrong credentials');
        }

        const isMatchPassword = await this.comparePassword({
            password: password,
            hash: foundUser.hashedPassword
        })

        if (!isMatchPassword) {
            throw new BadRequestException('Wrong credentials');
        }

        const token = await this.signToken({
            email: foundUser.email,
            id: foundUser.id,
        });

        if (!token) {
            throw new ForbiddenException();
        }

        res.cookie('token', token);

        return res.send({message: 'Logged in successfully'});
    }

    async signout(req: Request, res: Response) {
        res.clearCookie('token');
        return res.send({message: 'Logged out successfully'});
    }

    async hashPassword(password: string) {
        const saltOrRounds = 10;

        return await bcrypt.hash(password, saltOrRounds);
    }

    async comparePassword(args: { password: string, hash: string }) {
        return await bcrypt.compare(args.password, args.hash);
    }

    async signToken(args: { id: string, email: string }) {
        return this.jwt.signAsync(args, {secret: jwtSecret})
    }
}
