import { CreatePostInput } from '../types/CreatePostInput';
import { PostMutationResponse } from '../types/PostMutationResponse';
import {
  Arg,
  Mutation,
  Resolver,
  Query,
  ID,
  UseMiddleware,
} from 'type-graphql';
import { Post } from '../entities/Post';
import { UpdatePostInput } from '../types/UpdatePostInput';
import { checkAuth } from '../middleware/checkAuth';

@Resolver()
export class PostResolver {
  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async createPost(
    @Arg('createPostInput') { title, text }: CreatePostInput
  ): Promise<PostMutationResponse> {
    try {
      const newPost = Post.create({
        title,
        text,
      });

      await Post.save(newPost);

      return {
        code: 200,
        success: true,
        message: 'Post created successfully',
        post: newPost,
      };
    } catch (error) {
      console.log(error);
      return {
        code: 500,
        success: false,
        message: `Internal server error ${error.message}`,
      };
    }
  }

  @Query((_return) => [Post], { nullable: true })
  async posts(): Promise<Post[] | null> {
    try {
      return await Post.find();
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  @Query((_return) => Post, { nullable: true })
  async post(@Arg('id', (_type) => ID) id: number): Promise<Post | undefined> {
    try {
      const post = Post.findOne(id);
      return post;
    } catch (error) {
      return undefined;
    }
  }

  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async updatePost(
    @Arg('updatePostInput') { id, title, text }: UpdatePostInput
  ): Promise<PostMutationResponse> {
    try {
      const existingPost = await Post.findOne(id);

      if (!existingPost) {
        return {
          code: 404,
          success: false,
          message: 'Post not found',
        };
      }

      existingPost.title = title;
      existingPost.text = text;

      await Post.save(existingPost);

      return {
        code: 200,
        success: true,
        message: 'Post updated successfully',
        post: existingPost,
      };
    } catch (error) {
      console.log(error);
      return {
        code: 500,
        success: false,
        message: `Internal server error ${error.message}`,
      };
    }
  }

  @Mutation((_return) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async deletePost(
    @Arg('id', (_type) => ID) id: number
  ): Promise<PostMutationResponse> {
    try {
      const existingPost = await Post.findOne(id);

      if (!existingPost) {
        return {
          code: 404,
          success: false,
          message: 'Post not found',
        };
      }

      await Post.remove(existingPost);

      return {
        code: 200,
        success: true,
        message: 'Post deleted successfully',
      };
    } catch (error) {
      console.log(error);
      return {
        code: 500,
        success: false,
        message: `Internal server error ${error.message}`,
      };
    }
  }
}
