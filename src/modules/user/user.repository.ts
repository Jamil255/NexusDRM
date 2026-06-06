import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

/**
 * Custom repository for {@link User} providing specialised query methods
 * beyond the default TypeORM Repository API.
 */
@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  /** Expose the underlying TypeORM repository for generic operations. */
  get base(): Repository<User> {
    return this.repo;
  }

  /**
   * Finds a user by email and eagerly loads their assigned roles.
   *
   * @param email - The user's email address
   * @returns The user with roles loaded, or null
   */
  async findByEmailWithRoles(email: string): Promise<User | null> {
    return this.repo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .leftJoinAndSelect('userRole.role', 'role')
      .where('user.email = :email', { email })
      .getOne();
  }

  /**
   * Returns all users whose status is ACTIVE.
   *
   * @param page  - 1-based page number
   * @param limit - Items per page
   * @returns A tuple of [users, total count]
   */
  async findActiveUsers(page: number = 1, limit: number = 20): Promise<[User[], number]> {
    return this.repo.findAndCount({
      where: { status: 'ACTIVE' },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  /**
   * Returns the number of users belonging to a given organization.
   *
   * @param organizationId - The organization UUID
   * @returns The user count
   */
  async countByOrganization(organizationId: string): Promise<number> {
    return this.repo.count({
      where: { organizationId },
    });
  }
}
