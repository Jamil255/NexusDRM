import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { User } from '../user/entities/user.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { CreateOrgWithAdminDto } from './dto/create-org-with-admin.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { UserService } from '../user/user.service';
import { RbacService } from '../rbac/rbac.service';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly userService: UserService,
    private readonly rbacService: RbacService,
  ) {}

  async create(dto: CreateOrganizationDto): Promise<Organization> {
    const slug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await this.orgRepo.findOne({ where: { slug } });
    if (existing) {
      throw new ConflictException('An organization with a similar name/slug already exists');
    }

    const org = this.orgRepo.create({
      name: dto.name,
      slug,
      plan: dto.plan || 'free',
      settings: dto.settings || {},
    });

    return this.orgRepo.save(org);
  }

  async findAll(page: number = 1, limit: number = 20): Promise<{ items: Organization[]; total: number }> {
    const [items, total] = await this.orgRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total };
  }

  async findOne(id: string): Promise<Organization> {
    const org = await this.orgRepo.findOne({ where: { id } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    return org;
  }

  async update(id: string, dto: UpdateOrganizationDto): Promise<Organization> {
    const org = await this.findOne(id);
    Object.assign(org, dto);
    return this.orgRepo.save(org);
  }

  async getMembers(id: string): Promise<User[]> {
    await this.findOne(id);
    return this.userRepo.find({
      where: { organizationId: id },
      order: { createdAt: 'DESC' },
    });
  }

  async inviteMember(id: string, email: string): Promise<void> {
    await this.findOne(id);
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User with this email not found');
    }
    user.organizationId = id;
    await this.userRepo.save(user);
  }

  /**
   * Creates an organization and assigns an organization admin in one operation.
   *
   * @param dto - The organization and admin creation payload
   * @returns Object containing created organization and admin user
   */
  async createWithAdmin(dto: CreateOrgWithAdminDto): Promise<{ organization: Organization; admin: User }> {
    // Create organization
    const slug = dto.orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await this.orgRepo.findOne({ where: { slug } });
    if (existing) {
      throw new ConflictException('An organization with a similar name/slug already exists');
    }

    const org = this.orgRepo.create({
      name: dto.orgName,
      slug,
      plan: dto.plan || 'free',
      settings: dto.settings || {},
    });

    const savedOrg = await this.orgRepo.save(org);

    // Create admin user for the organization
    const adminUser = await this.userService.createOrgAdmin(
      {
        email: dto.adminEmail,
        password: dto.adminPassword,
        firstName: dto.adminFirstName,
        lastName: dto.adminLastName,
      },
      savedOrg.id,
    );

    // Assign org_admin role to the user
    const orgAdminRole = await this.rbacService.getRoleByName('org_admin');
    if (orgAdminRole) {
      await this.rbacService.assignRoleToUser(
        {
          userId: adminUser.id,
          roleId: orgAdminRole.id,
        },
        savedOrg.id,
      );
    }

    return {
      organization: savedOrg,
      admin: adminUser,
    };
  }
}
