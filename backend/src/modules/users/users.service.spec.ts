import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('UsersService', () => {
  let service: UsersService;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedpassword',
    role: 'participant',
    save: jest.fn().mockResolvedValue({
      _id: '507f1f77bcf86cd799439011',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'participant',
    }),
  };

  const mockUserModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    constructor: jest.fn(),
  };

  // Mock the constructor behavior
  function MockUserModel(dto: any) {
    return {
      ...dto,
      save: jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        ...dto,
      }),
    };
  }
  MockUserModel.findOne = mockUserModel.findOne;
  MockUserModel.findById = mockUserModel.findById;
  MockUserModel.find = mockUserModel.find;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: MockUserModel },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    it('should create a new user', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashedpassword'));

      const result = await service.create(createUserDto);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: createUserDto.email });
      expect(result).toBeDefined();
    });

    it('should throw ConflictException if email exists', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('john@example.com');

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);

      const result = await service.findById('507f1f77bcf86cd799439011');

      expect(mockUserModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [mockUser];
      mockUserModel.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(mockUserModel.find).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });
});
