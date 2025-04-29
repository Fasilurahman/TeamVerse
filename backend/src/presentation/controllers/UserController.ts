import { Request,Response, NextFunction, Express } from "express";
import { UserRepository } from "../../infrastructure/database/repositories/UserRepository";
import { GetAllUsersUseCase } from "../../application/usecases/user/GetAllUsersUseCase";
import { BlockUserUseCase } from "../../application/usecases/user/BlockUserUseCase";
import { UpdateUserUseCase } from "../../application/usecases/user/UpdateUserUseCase";
import { STATUS_CODES } from "../../shared/constants/statusCodes"
import { GetUserByEmailUseCase } from "../../application/usecases/user/GetUserByEmailUseCase ";
import { MESSAGES } from "../../shared/constants/ResponseMessages";
import { SearchUsersUseCase } from '../../application/usecases/user/SearchUsersUseCase'
import { GetAllUsersAdminUseCase } from "../../application/usecases/user/GetAllUsersAdminSideUseCase";
import { FetchDetailsUseCase } from "../../application/usecases/user/FetchDetailsUseCase";
import { GetUserByIdUseCase } from "../../application/usecases/user/GetUserByIdUseCase";

export class UserController {
  private readonly userRepository: UserRepository;
  private readonly getAllUsersUseCase: GetAllUsersUseCase;
  private readonly blockUserUseCase: BlockUserUseCase;
  private readonly updateUserUseCase: UpdateUserUseCase;
  private readonly getUserByEmailUseCase: GetUserByEmailUseCase;
  private readonly searchUsersUseCase: SearchUsersUseCase;
  private readonly getAllUsersAdminUseCase: GetAllUsersAdminUseCase;
  private readonly fetchDetailsUseCase: FetchDetailsUseCase;
  private readonly getUserByIdUseCase: GetUserByIdUseCase;

  constructor() {
      this.userRepository = new UserRepository();
      this.getAllUsersUseCase = new GetAllUsersUseCase(this.userRepository);
      this.blockUserUseCase = new BlockUserUseCase(this.userRepository);
      this.updateUserUseCase = new UpdateUserUseCase(this.userRepository);
      this.getUserByEmailUseCase = new GetUserByEmailUseCase(this.userRepository);
      this.searchUsersUseCase = new SearchUsersUseCase(this.userRepository);
      this.getAllUsersAdminUseCase = new GetAllUsersAdminUseCase(this.userRepository);
      this.fetchDetailsUseCase = new FetchDetailsUseCase(this.userRepository);
      this.getUserByIdUseCase = new GetUserByIdUseCase(this.userRepository);
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
  
      const { users, totalUsers } = await this.getAllUsersAdminUseCase.execute(page, limit);
  
      return res.status(STATUS_CODES.OK).json({
        users,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
      });
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      next(error);
    }
  }
  
  

  async blockUser(req: Request, res: Response, next: NextFunction) {
      try {
          const { id } = req.params;
          const user = await this.blockUserUseCase.execute(id);

          if (!user) {
              return res.status(STATUS_CODES.NOT_FOUND).json({
                  message: MESSAGES.USER.USER_NOT_FOUND
              });
          }

          res.status(STATUS_CODES.OK).json({
              message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`,
              user,
          });
      } catch (error) {
          next(error);
      }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
      try {
          const { email, name, location, phone } = req.body;
          const profilePic = (req.file as Express.MulterS3.File)?.key || undefined;

          const updatedUser = await this.updateUserUseCase.execute({
              email,
              name,
              location,
              phone,
              profilePic,
          });

          if (!updatedUser) {
              return res.status(STATUS_CODES.NOT_FOUND).json({
                  message: MESSAGES.USER.USER_NOT_FOUND
              });
          }

          const token = req.headers.authorization?.split(" ")[1];
          res.status(STATUS_CODES.OK).json({
              message: MESSAGES.USER.USER_UPDATED,
              user: updatedUser,
              token
          });
      } catch (error) {
          next(error);
      }
  }

  async getUserProfile(req: Request, res: Response, next: NextFunction) {
      try {
          const userEmail = req.user?.email || req.body.email;
          const user = await this.getUserByEmailUseCase.execute(userEmail);

          if (!user) {
              return res.status(STATUS_CODES.NOT_FOUND).json({
                  message: MESSAGES.USER.USER_NOT_FOUND
              });
          }

          res.status(STATUS_CODES.OK).json(user);
      } catch (error) {
          next(error);
      }
  }

  async searchUsers(req: Request, res: Response, next: NextFunction) {
      try {
          const { query } = req.query;
          const users = await this.searchUsersUseCase.execute(query as string);
          res.status(STATUS_CODES.OK).json(users);
      } catch (error) {
          console.error('Error in searchUsers:', error);
          next(error);
      }
  }

  async fetchDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;

      const subscriptionDetails = await this.fetchDetailsUseCase.execute(userId);
      res.status(STATUS_CODES.OK).json(subscriptionDetails);
    } catch (error) {
      console.error('Error in SubscriptionController fetchDetails:', error);
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.params.id;
        const user = await this.getUserByIdUseCase.execute(userId);
        res.status(STATUS_CODES.OK).json(user);
    } catch (error) {
        next(error);
    }
  }
}