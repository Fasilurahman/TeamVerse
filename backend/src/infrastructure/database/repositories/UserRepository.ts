import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { User } from "../../../domain/entities/User";
import { UserModel } from "../models/userModel";
import { TeamModel } from "../models/TeamModel";
import mongoose from "mongoose";

export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    try {
      console.log("entering to user repository");

      const userDoc = await UserModel.findOne({ email });
      if (!userDoc) {
        console.log("User not found in database");

        return null;
      }

      return new User(
        userDoc._id.toString(),
        userDoc.name,
        userDoc.email,
        userDoc.role as "admin" | "team-lead" | "employee",
        userDoc.password || null,
        userDoc.profilePic,
        userDoc.teamId ? userDoc.teamId.toString() : null,
        userDoc.projects?.map((p) => p.toString()) || [],
        userDoc.createdAt,
        userDoc.updatedAt,
        userDoc.isBlocked,
        userDoc.phone ?? null,
        userDoc.location ?? null,
        userDoc.company ?? null,
        userDoc.status as "active" | "inactive",
        userDoc.isSubscribed,
        userDoc.stripeSubscriptionId ?? null,
        userDoc.subscriptionId?.toString() ?? null,
        userDoc.subscriptionStart ?? null,
        userDoc.subscriptionExpiry ?? null
      );
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw new Error("Failed to fetch user by email");
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const userDoc = await UserModel.findById(id);
      if (!userDoc) return null;

      return new User(
        userDoc._id.toString(),
        userDoc.name,
        userDoc.email,
        userDoc.role as "admin" | "team-lead" | "employee",
        userDoc.password || null,
        userDoc.profilePic,
        userDoc.teamId ? userDoc.teamId.toString() : null,
        userDoc.projects?.map((p) => p.toString()) || [],
        userDoc.createdAt,
        userDoc.updatedAt,
        userDoc.isBlocked,
        userDoc.phone ?? null,
        userDoc.location ?? null,
        userDoc.company ?? null,
        userDoc.status as "active" | "inactive",
        userDoc.isSubscribed,
        userDoc.stripeSubscriptionId ?? null,
        userDoc.subscriptionId?.toString() ?? null,
        userDoc.subscriptionStart ?? null,
        userDoc.subscriptionExpiry ?? null
      );
    } catch (error) {
      console.error("Error finding user by ID:", error);
      throw new Error("Failed to fetch user by ID");
    }
  }

  async save(user: User): Promise<User> {
    try {
      const userDoc = await UserModel.create({
        name: user.name,
        email: user.email,
        role: user.role,
        password: user.password,
        profilePic: user.profilePic,
        teamId: user.teamId,
        projects: user.projects,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isBlocked: user.isBlocked,
        phone: user.phone,
        location: user.location,
        company: user.company,
        status: user.status,
        isSubscribed: user.isSubscribed,
        stripeSubscriptionId: user.stripeSubscriptionId,
        subscriptionId: user.subscriptionId,
        subscriptionStart: user.subscriptionStart,
        subscriptionExpiry: user.subscriptionExpiry,
      });

      return new User(
        userDoc._id.toString(),
        userDoc.name,
        userDoc.email,
        userDoc.role as "admin" | "team-lead" | "employee",
        userDoc.password || null,
        userDoc.profilePic,
        userDoc.teamId ? userDoc.teamId.toString() : null,
        userDoc.projects ? userDoc.projects.map((p: any) => p.toString()) : [],
        userDoc.createdAt,
        userDoc.updatedAt,
        userDoc.isBlocked,
        userDoc.phone ?? null,
        userDoc.location ?? null,
        userDoc.company ?? null,
        userDoc.status as "active" | "inactive",
        userDoc.isSubscribed,
        userDoc.stripeSubscriptionId ?? null,
        userDoc.subscriptionId?.toString() ?? null,
        userDoc.subscriptionStart ?? null,
        userDoc.subscriptionExpiry ?? null
      );
    } catch (error) {
      console.error("Error saving user:", error);
      throw new Error("Failed to save user");
    }
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    try {
      await UserModel.findByIdAndUpdate(id, { password: newPassword });
    } catch (error) {
      console.error("Error updating password:", error);
      throw new Error("Failed to update password");
    }
  }

  async findAll() {
    try {
      const users = await UserModel.find();

      return users.map(
        (userDoc) =>
          new User(
            userDoc._id.toString(),
            userDoc.name,
            userDoc.email,
            userDoc.role as "admin" | "team-lead" | "employee",
            userDoc.password || null,
            userDoc.profilePic,
            userDoc.teamId?.toString() ?? null,
            userDoc.projects?.map((p) => p.toString()) || [],
            userDoc.createdAt,
            userDoc.updatedAt,
            userDoc.isBlocked,
            userDoc.phone ?? null,
            userDoc.location ?? null,
            userDoc.company ?? null,
            userDoc.status as "active" | "inactive",
            userDoc.isSubscribed,
            userDoc.stripeSubscriptionId ?? null,
            userDoc.subscriptionId?.toString() ?? null,
            userDoc.subscriptionStart ?? null,
            userDoc.subscriptionExpiry ?? null
          )
      );
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw new Error("Failed to fetch users");
    }
  }

  /**
   * Update specific fields of a user
   * @param id - User ID
   * @param updateData - Partial user fields to update
   */
  async update(userId: string, data: Partial<User>): Promise<User | null> {
    return await UserModel.findByIdAndUpdate(userId, data, { new: true });
  }

  async updateUserProfile(
    email: string,
    updateData: Partial<User>
  ): Promise<User | null> {
    try {
      const updatedUser = await UserModel.findOneAndUpdate(
        { email },
        { $set: updateData },
        { new: true }
      );

      if (!updatedUser) return null;

      return new User(
        updatedUser._id.toString(),
        updatedUser.name,
        updatedUser.email,
        updatedUser.role as "admin" | "team-lead" | "employee",
        updatedUser.password || null,
        updatedUser.profilePic,
        updatedUser.teamId?.toString() ?? null,
        updatedUser.projects?.map((p) => p.toString()) || [],
        updatedUser.createdAt,
        updatedUser.updatedAt,
        updatedUser.isBlocked,
        updatedUser.phone ?? null,
        updatedUser.location ?? null,
        updatedUser.company ?? null,
        updatedUser.status as "active" | "inactive",
        updatedUser.isSubscribed,
        updatedUser.stripeSubscriptionId ?? null,
        updatedUser.subscriptionId?.toString() ?? null,
        updatedUser.subscriptionStart ?? null,
        updatedUser.subscriptionExpiry ?? null
      );
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw new Error("Failed to update user profile");
    }
  }

  async getTeamMembers(teamId: string | mongoose.Types.ObjectId) {
    const team = await TeamModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(teamId) }, // Match the team by ID
      },
      {
        $lookup: {
          from: "users", // The collection name for users
          localField: "members", // The field in the Team collection
          foreignField: "_id", // The field in the User collection
          as: "teamMembers", // The output array name
        },
      },
      {
        $project: {
          _id: 0, // Exclude team document details
          teamMembers: 1, // Only return team members
        },
      },
    ]);

    if (!team || team.length === 0) {
      console.log("Team not found");
      return [];
    }

    console.log("Fetched Members:", team[0].teamMembers);
    return team[0].teamMembers;
  }

  async search(query: string): Promise<User[]> {
    const users = await UserModel.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { phone: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } },
      ],
    }).exec();

    return users.map(
      (user) =>
        new User(
          user._id.toString(),
          user.name,
          user.email,
          user.role,
          user.password || null,
          user.profilePic,
          user.teamId?.toString() ?? null,
          user.projects?.map((p) => p.toString()) || [],
          user.createdAt,
          user.updatedAt,
          user.isBlocked,
          user.phone ?? null,
          user.location ?? null,
          user.company ?? null,
          user.status,
          user.isSubscribed,
          user.stripeSubscriptionId ?? null,
          user.subscriptionId?.toString() ?? null,
          user.subscriptionStart ?? null,
          user.subscriptionExpiry ?? null
        )
    );
  }

  async findAllUsers(page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;

      const users = await UserModel.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const totalUsers = await UserModel.countDocuments();
      console.log("Total users:", users);

      return {
        users: users.map(
          (userDoc) =>
            new User(
              userDoc._id.toString(),
              userDoc.name,
              userDoc.email,
              userDoc.role as "admin" | "team-lead" | "employee",
              userDoc.password || null,
              userDoc.profilePic,
              userDoc.teamId?.toString() ?? null,
              userDoc.projects?.map((p) => p.toString()) || [],
              userDoc.createdAt,
              userDoc.updatedAt,
              userDoc.isBlocked,
              userDoc.phone ?? null,
              userDoc.location ?? null,
              userDoc.company ?? null,
              userDoc.status as "active" | "inactive",
              userDoc.isSubscribed,
              userDoc.stripeSubscriptionId ?? null,
              userDoc.subscriptionId?.toString() ?? null,
              userDoc.subscriptionStart ?? null,
              userDoc.subscriptionExpiry ?? null
            )
        ),
        totalUsers,
      };
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw new Error("Failed to fetch users");
    }
  }

  async fetchDetailsByUserId(userId: string) {
    const user = await UserModel.findById(userId)
      .populate("subscriptionId")
      .select(
        "isSubscribed subscriptionId subscriptionStart subscriptionExpiry"
      );

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async findUserById(id: string) {
    const user = await UserModel.findById(id)
      .populate('subscriptionId');

    return user;
  }
  
}
