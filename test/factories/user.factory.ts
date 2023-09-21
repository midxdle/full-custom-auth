import { TestingModule } from '@nestjs/testing';
import { Factory } from './factory';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { UserService } from 'src/user/user.service';

export class UserFactory extends Factory<UserDocument> {
  modelToken = User.name;

  userService: UserService;

  async create(partialUser?: Partial<User>): Promise<UserDocument> {
    const testUser = new this.model(
      new User({
        email: this.faker.internet.email(),
        username: this.faker.internet.userName(),
        password:
          '$2b$04$Uvn5oVukGi4s1RXilFfj3u4Fmg1qw3wa1qQyniBHhmi7lMJJ9aaQO', // myPassword123
        ...partialUser,
      }),
    );
    return testUser.save();
  }

  async createWithToken(): Promise<[UserDocument, string]> {
    const user = await this.create();
    const token = await this.userService.createTokenForUser({ user });
    return [user, token];
  }

  setModel(module: TestingModule) {
    this.userService = module.get(UserService);
    return super.setModel(module);
  }
}
