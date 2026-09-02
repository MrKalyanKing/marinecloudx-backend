import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";

import { UserStatus } from "../contracts";
import { BaseMutableEntity } from "./_shared/primary-id";

/**
 * Team / access foundation. Maps 1:1 to the legacy `"Role"` and `"User"`
 * tables — column names, types, nullability and defaults are identical, so the
 * existing database is used unchanged (`synchronize: false`).
 */

@Entity({ name: "Role" })
export class RoleEntity extends BaseMutableEntity {
  @Index("Role_name_key", { unique: true })
  @Column({ type: "text" })
  name!: string;

  @Index("Role_slug_key", { unique: true })
  @Column({ type: "text" })
  slug!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "int", default: 100 })
  level!: number;

  @Column({ type: "boolean", default: false })
  isSystem!: boolean;



  @OneToMany(() => UserEntity, (user) => user.role)
  users?: UserEntity[];
}

@Index("User_roleId_idx", ["roleId"])
@Index("User_status_idx", ["status"])
@Index("User_phone_idx", ["phone"])
@Entity({ name: "User" })
export class UserEntity extends BaseMutableEntity {
  @Column({ type: "text" })
  name!: string;

  @Index("User_email_key", { unique: true })
  @Column({ type: "text" })
  email!: string;

  @Column({ type: "text", nullable: true })
  phone!: string | null;

  @Column({ type: "enum", enum: UserStatus, enumName: "UserStatus", default: UserStatus.INVITED })
  status!: UserStatus;

  /** bcrypt hash. Null for invited-but-not-activated accounts. Never serialized. */
  @Column({ type: "text", nullable: true })
  passwordHash!: string | null;

  @Column({ type: "timestamptz", precision: 6, nullable: true })
  emailVerifiedAt!: Date | null;

  @Column({ type: "timestamptz", precision: 6, nullable: true })
  lastLoginAt!: Date | null;

  @Column({ type: "text" })
  roleId!: string;

  @ManyToOne(() => RoleEntity, (role) => role.users, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "roleId" })
  role?: RoleEntity;


}
