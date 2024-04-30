import { IsEmail, IsNotEmpty, IsString, Length} from 'class-validator';

export class AuthDto {
    @IsEmail()
    public email: string;

    @IsNotEmpty()
    @IsString()
    @Length(3,20,{message: 'Password must be at least 3 characters and 20 characters'})
    public password: string;
}