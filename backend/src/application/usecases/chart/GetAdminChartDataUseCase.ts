import { SubscriptionRepository } from "../../../infrastructure/database/repositories/SubscriptionRepository";
import { UserRepository } from "../../../infrastructure/database/repositories/UserRepository";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export class GetAdminChartDataUseCase {
  constructor(
    private subscriptionRepository: SubscriptionRepository,
    private userRepository: UserRepository
  ) {}

  async execute() {
    const subscriptions = await this.subscriptionRepository.getAll();
    const users = await this.userRepository.findAll();

    // Initialize monthly revenue and user activity
    const revenueByMonth: Record<string, number> = MONTHS.reduce((acc, month) => {
      acc[month] = 0;
      return acc;
    }, {} as Record<string, number>);

    const userActivityByMonth: Record<string, number> = MONTHS.reduce((acc, month) => {
      acc[month] = 0;
      return acc;
    }, {} as Record<string, number>);

    let totalRevenue = 0;

    subscriptions?.forEach((sub) => {
      if (!sub.createdAt) return;

      const createdAt = new Date(sub.createdAt);
      const month = MONTHS[createdAt.getMonth()];
      const revenue = sub.price * sub.activeUsers;

      revenueByMonth[month] += revenue;
      totalRevenue += revenue;
    });

    // Process user signups
    users?.forEach((user) => {
      if (!user.createdAt) return;

      const createdAt = new Date(user.createdAt);
      const month = MONTHS[createdAt.getMonth()];

      userActivityByMonth[month] += 1;
    });

    const revenueData = MONTHS.map((month) => ({
      name: month,
      value: revenueByMonth[month],
    }));

    const userActivity = MONTHS.map((month) => ({
      name: month,
      value: userActivityByMonth[month],
    }));

    return {
      revenueData,
      userActivity,
      totalRevenue,
    };
  }
}
