import "reflect-metadata";
import express from 'express';
require('dotenv').config();
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from "type-graphql"
import { UserResolver } from './UserResolver';
import { AppDataSource } from "./data-source";
import cookieParser from "cookie-parser";
import { verify } from "jsonwebtoken";
import { User } from "./entity/User";
import { createAccessToken, createRefreshToken } from "./auth";
import { sendRefreshToken } from "./sendRefreshToken";
import { ProductResolver } from "./ProductResolver";

(async () => {
    const app = await express();
    app.use(cookieParser());
    app.get('/', (_req, res) => res.send("Teebay Server Running"));

    // refresh token
    app.post('/refresh_token', async (req, res) => {
        const token = req.cookies.teebayToken;
        if (!token) {
            return res.send({ ok: false, accessToken: '' })
        }
        let payload: any = null;
        try {
            payload = verify(token, process.env.REFRESH_TOKEN_HEX!)
        } catch (error) {
            console.log(error);
            return res.send({ ok: false, accessToken: '' });
        }
        // Token is valid
        const user = await User.findOne({ where: { id: payload.userId } })

        if (!user) {
            return res.send({ ok: false, accessToken: '' });
        }

        if (user.tokenVersion !== payload.tokenVersion) {
            return res.send({ ok: false, accessToken: '' });
        }

        sendRefreshToken(res, createRefreshToken(user));

        return res.send({ ok: true, accessToken: createAccessToken(user) });
    })

    await AppDataSource.initialize();

    const apolloServer = await new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver, ProductResolver]
        }),
        context: ({ req, res }) => ({ req, res })
    });
    await apolloServer.start()
    await apolloServer.applyMiddleware({ app });

    app.listen(5000, () => {
        console.log('Teebay server started')
    });
})();

