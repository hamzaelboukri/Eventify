import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../modules/users/users.service';
import { Role } from '../common/enums/role.enum';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const usersService = app.get(UsersService);

  // Create admin user
  try {
    await usersService.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@eventify.com',
      password: 'Admin@123',
      role: Role.ADMIN,
    });
    console.log('✅ Admin user created successfully');
    console.log('   Email: admin@eventify.com');
    console.log('   Password: Admin@123');
  } catch (error) {
    if (error.status === 409) {
      console.log('ℹ️  Admin user already exists');
    } else {
      console.error('❌ Error creating admin user:', error.message);
    }
  }

  // Create sample participant
  try {
    await usersService.create({
      firstName: 'John',
      lastName: 'Participant',
      email: 'participant@eventify.com',
      password: 'User@123',
      role: Role.PARTICIPANT,
    });
    console.log('✅ Sample participant created successfully');
    console.log('   Email: participant@eventify.com');
    console.log('   Password: User@123');
  } catch (error) {
    if (error.status === 409) {
      console.log('ℹ️  Sample participant already exists');
    } else {
      console.error('❌ Error creating sample participant:', error.message);
    }
  }

  await app.close();
  process.exit(0);
}

seed();
