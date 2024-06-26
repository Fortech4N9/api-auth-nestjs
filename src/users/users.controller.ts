import {Controller, Get, Param, UseGuards, Req} from '@nestjs/common';
import {UsersService} from './users.service';
import {JwtAuthGuard} from "../auth/jwt.guard";
import {Request} from "express";

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    getMyUser(@Param() params: { id: string }, @Req() req: Request) {
        return this.usersService.getMyUser(params.id, req);
    }

    @Get()
    getUsers() {
        return this.usersService.getUsers();
    }
}
