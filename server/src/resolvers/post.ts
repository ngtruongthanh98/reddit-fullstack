import { CreatePostInput } from '../types/CreatePostInput';
import { PostMutationResponse } from '../types/PostMutationResponse';
import { Arg, Mutation, Resolver, Query } from 'type-graphql';
import { Post } from '../entities/Post';

@Resolver()
export class PostResolver {
  @Mutation((_return) => PostMutationResponse)
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

  @Query((_return) => [Post])
  async posts(): Promise<Post[]> {
    return Post.find();
  }
}
