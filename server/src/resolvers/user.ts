import { User } from '../entities/User';
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';
import argon2 from 'argon2';
import { UserMutationResponse } from '../types/UserMutationResponse';
import { RegisterInput } from '../types/RegisterInput';
import { validateRegisterInput } from '../utils/validateRegisterInput';
import { LoginInput } from '../types/LoginInput';
import { Context } from '../types/Context';
import { COOKIE_NAME } from '../constants';

@Resolver()
export class UserResolver {
  //* Register mutation
  @Mutation((_returns) => UserMutationResponse, { nullable: true })
  async register(
    @Arg('registerInput') registerInput: RegisterInput,
    @Ctx() { req }: Context
  ): Promise<UserMutationResponse> {
    const validateRegisterInputErrors = validateRegisterInput(registerInput);

    if (validateRegisterInputErrors !== null) {
      return { code: 400, success: false, ...validateRegisterInputErrors };
    }

    try {
      const { email, username, password } = registerInput;
      const existingUser = await User.findOne({
        where: [{ email }, { username }],
      });
      if (existingUser) {
        return {
          code: 400,
          success: false,
          message: 'User already exists',
          errors: [
            {
              field: existingUser.username === username ? 'username' : 'email',
              message: `${
                existingUser.username === username ? 'Username' : 'Email'
              } already exists`,
            },
          ],
        };
      }

      const hashedPassword = await argon2.hash(password);

      let newUser = User.create({
        email,
        username,
        password: hashedPassword,
      });

      newUser = await User.save(newUser);

      req.session.userId = newUser.id;

      return {
        code: 200,
        success: true,
        message: 'User created successfully',
        user: newUser,
      };
    } catch (error) {
      console.error(error);
      return {
        code: 500,
        success: false,
        message: `Internal server error: ${error.message}`,
      };
    }
  }

  //* Login mutation
  @Mutation((_returns) => UserMutationResponse)
  async login(
    @Arg('loginInput') loginInput: LoginInput,
    @Ctx() { req }: Context
  ): Promise<UserMutationResponse> {
    try {
      const { usernameOrEmail, password } = loginInput;
      const existingUser = await User.findOne(
        usernameOrEmail.includes('@')
          ? { email: usernameOrEmail }
          : { username: usernameOrEmail }
      );

      if (!existingUser) {
        return {
          code: 400,
          success: false,
          message: 'User not found',
          errors: [
            {
              field: 'usernameOrEmail',
              message: 'User not found',
            },
          ],
        };
      }

      const isValidPassword = await argon2.verify(
        existingUser.password,
        password
      );

      if (!isValidPassword) {
        return {
          code: 400,
          success: false,
          message: 'Invalid password',
          errors: [
            {
              field: 'password',
              message: 'Invalid password',
            },
          ],
        };
      }

      // Create session and return cookie
      req.session.userId = existingUser.id;

      return {
        code: 200,
        success: true,
        message: 'User logged in successfully',
        user: existingUser,
      };
    } catch (error) {
      console.log(error.message);
      return {
        code: 500,
        success: false,
        message: `Internal server error: ${error.message}`,
      };
    }
  }

  //* Logout mutation
  @Mutation((_returns) => Boolean)
  logout(@Ctx() { req, res }: Context): Promise<boolean> {
    return new Promise((resolve, _reject) => {
      res.clearCookie(COOKIE_NAME);

      req.session.destroy((error) => {
        if (error) {
          console.log('DESTROYING SESSION ERROR ', error);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}
