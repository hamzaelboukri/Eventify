import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser = {
    id: '507f1f77bcf86cd799439011',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'participant',
    toJSON: jest.fn().mockReturnValue({
      id: '507f1f77bcf86cd799439011',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'participant',
    }),
  };

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    it('should register a new user', async () => {
      const expectedResult = {
        user: mockUser.toJSON(),
        access_token: 'mock-jwt-token',
      };
      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    it('should login user and return token', async () => {
      const expectedResult = {
        user: mockUser.toJSON(),
        access_token: 'mock-jwt-token',
      };
      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getProfile', () => {
    it('should return current user profile', async () => {
      const result = await controller.getProfile(mockUser as any);

      expect(result).toEqual(mockUser.toJSON());
    });
  });
});
