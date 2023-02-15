import { Resolver, Query, Mutation, Arg, ObjectType, Field, Ctx, UseMiddleware, Int } from "type-graphql";
import { User } from "./entity/User";
import { compare, hash } from 'bcrypt';
import { MyContext } from "./MyContext";
import { createAccessToken, createRefreshToken } from "./auth";
import { isAuth } from "./isAuth";
import { sendRefreshToken } from "./sendRefreshToken";
import { AppDataSource } from "./data-source";


@ObjectType()
class LoginResponse {
    @Field()
    accessToken: string
}

@Resolver()
export class UserResolver {
    // @Query(() => String)
    // hello() {
    //     return 'Hi!!!'
    // }

    @Query(() => String)
    @UseMiddleware(isAuth)
    private(
        @Ctx() { payload }: MyContext
    ) {
        console.log(payload);
        return `Your user id is: ${payload!.userId}`
    }

    @Query(() => [User])
    users() {
        return User.find()
    }

    @Mutation(() => Boolean)
    async revokeRefreshTokens(
        @Arg('userId', () => Int) userId: number
    ) {
        await (await AppDataSource.initialize()).getRepository(User).increment({ id: userId }, 'tokenVersion', 1);
        return true;
    }


    @Mutation(() => LoginResponse)
    async login(
        @Arg('email') email: string,
        @Arg('password') password: string,
        @Ctx() { res }: MyContext
    ): Promise<LoginResponse> {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            throw new Error('User No Exist');
        }
        const valid = await compare(password, user.password);

        if (!valid) {
            throw new Error("Wrong password, Try again")
        }
        // Login Successful
        sendRefreshToken(res, createRefreshToken(user));
        return {
            accessToken: createAccessToken(user)
        };
    }

    @Mutation(() => Boolean)
    async register(
        @Arg('firstName') firstName: string,
        @Arg('lastName') lastName: string,
        @Arg('address') address: string,
        @Arg('number') number: number,
        @Arg('email') email: string,
        @Arg('password') password: string,
    ) {
        const user = await User.findOne({ where: { email } });

        if (user) {
            throw new Error('User Exist');
        }
        const hashedPassword = await hash(password, 10);
        try {
            await User.insert({
                firstName,
                lastName,
                address,
                number,
                email,
                password: hashedPassword
            });
        } catch (error) {
            console.log(error)
            return false
        }
        return true;
    }
}