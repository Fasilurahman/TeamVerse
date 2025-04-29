import { SubscriptionRepository } from "../../../infrastructure/database/repositories/SubscriptionRepository";
import { UserRepository } from "../../../infrastructure/database/repositories/UserRepository";

export class GetAdminStatsUseCase {
  constructor(
    private subscriptionRepository: SubscriptionRepository,
    private userRepository: UserRepository
  ) {}

  async execute() {
    const subscriptions = await this.subscriptionRepository.getAll();
    const users = await this.userRepository.findAll();

    if (subscriptions === null || users === null) {
      throw new Error("Failed to retrieve data");
    }

    const totalRevenue = subscriptions.reduce(
      (acc, sub) => acc + sub.price * sub.activeUsers,
      0
    );

    const totalUsers = users.length;

    const activeSubscriptions = subscriptions.filter(
      (sub) => sub.activeUsers > 0
    ).length;

    const conversionRate =
      totalUsers > 0 ? ((activeSubscriptions / totalUsers) * 100).toFixed(1) + "%" : "0%";

    return {
      totalRevenue,
      totalUsers,
      activeSubscriptions,
      conversionRate,
    };
  }
}
