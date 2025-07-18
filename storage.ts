import {
  users,
  residents,
  type User,
  type UpsertUser,
  type Resident,
  type InsertResident,
  type UpdateResident,
  type ResidentWithUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, or, and, isNull, desc, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Resident operations
  getResident(id: number): Promise<ResidentWithUser | undefined>;
  getResidentByUserId(userId: string): Promise<ResidentWithUser | undefined>;
  getResidents(filters?: {
    location?: string;
    search?: string;
    occupation?: string;
    returning?: boolean;
    awayLong?: boolean;
  }): Promise<ResidentWithUser[]>;
  createResident(resident: InsertResident): Promise<Resident>;
  updateResident(id: number, updates: UpdateResident): Promise<Resident>;
  deleteResident(id: number): Promise<void>;
  
  // Analytics
  getLocationStats(): Promise<{ location: string; count: number }[]>;
  getOccupationStats(): Promise<{ occupation: string; count: number }[]>;
  getTotalStats(): Promise<{
    total: number;
    inVillage: number;
    inCity: number;
    abroad: number;
  }>;
  
  // Admin operations
  getAllUsers(): Promise<(User & { resident?: Resident })[]>;
  updateUserRole(userId: string, role: string): Promise<User>;
  deleteUser(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Resident operations
  async getResident(id: number): Promise<ResidentWithUser | undefined> {
    const [resident] = await db
      .select()
      .from(residents)
      .leftJoin(users, eq(residents.userId, users.id))
      .where(eq(residents.id, id));
    
    if (!resident) return undefined;
    
    return {
      ...resident.residents,
      user: resident.users,
    };
  }

  async getResidentByUserId(userId: string): Promise<ResidentWithUser | undefined> {
    const [resident] = await db
      .select()
      .from(residents)
      .leftJoin(users, eq(residents.userId, users.id))
      .where(eq(residents.userId, userId));
    
    if (!resident) return undefined;
    
    return {
      ...resident.residents,
      user: resident.users,
    };
  }

  async getResidents(filters?: {
    location?: string;
    search?: string;
    occupation?: string;
    returning?: boolean;
    awayLong?: boolean;
  }): Promise<ResidentWithUser[]> {
    let query = db
      .select()
      .from(residents)
      .leftJoin(users, eq(residents.userId, users.id))
      .where(eq(residents.isVisible, true));

    const conditions = [];

    if (filters?.location) {
      conditions.push(eq(residents.currentLocation, filters.location));
    }

    if (filters?.search) {
      conditions.push(
        or(
          ilike(residents.fullName, `%${filters.search}%`),
          ilike(residents.phoneNumber, `%${filters.search}%`),
          ilike(residents.company, `%${filters.search}%`)
        )
      );
    }

    if (filters?.occupation) {
      conditions.push(eq(residents.occupation, filters.occupation));
    }

    if (filters?.returning) {
      const thisMonth = new Date();
      const nextMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1);
      conditions.push(
        and(
          sql`${residents.expectedReturnDate} >= ${thisMonth.toISOString().split('T')[0]}`,
          sql`${residents.expectedReturnDate} < ${nextMonth.toISOString().split('T')[0]}`
        )
      );
    }

    if (filters?.awayLong) {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      conditions.push(
        and(
          sql`${residents.departureDate} < ${oneYearAgo.toISOString().split('T')[0]}`,
          sql`${residents.currentLocation} != 'village'`
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.orderBy(desc(residents.createdAt));

    return results.map(result => ({
      ...result.residents,
      user: result.users,
    }));
  }

  async createResident(resident: InsertResident): Promise<Resident> {
    const [newResident] = await db
      .insert(residents)
      .values(resident)
      .returning();
    return newResident;
  }

  async updateResident(id: number, updates: UpdateResident): Promise<Resident> {
    const [updatedResident] = await db
      .update(residents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(residents.id, id))
      .returning();
    return updatedResident;
  }

  async deleteResident(id: number): Promise<void> {
    await db.delete(residents).where(eq(residents.id, id));
  }

  // Analytics
  async getLocationStats(): Promise<{ location: string; count: number }[]> {
    const stats = await db
      .select({
        location: residents.currentLocation,
        count: count(),
      })
      .from(residents)
      .where(eq(residents.isVisible, true))
      .groupBy(residents.currentLocation);

    return stats.map(stat => ({
      location: stat.location,
      count: Number(stat.count),
    }));
  }

  async getOccupationStats(): Promise<{ occupation: string; count: number }[]> {
    const stats = await db
      .select({
        occupation: residents.occupation,
        count: count(),
      })
      .from(residents)
      .where(eq(residents.isVisible, true))
      .groupBy(residents.occupation);

    return stats.map(stat => ({
      occupation: stat.occupation,
      count: Number(stat.count),
    }));
  }

  async getTotalStats(): Promise<{
    total: number;
    inVillage: number;
    inCity: number;
    abroad: number;
  }> {
    const [totalResult] = await db
      .select({ count: count() })
      .from(residents)
      .where(eq(residents.isVisible, true));

    const [villageResult] = await db
      .select({ count: count() })
      .from(residents)
      .where(and(eq(residents.isVisible, true), eq(residents.currentLocation, 'village')));

    const [cityResult] = await db
      .select({ count: count() })
      .from(residents)
      .where(and(eq(residents.isVisible, true), eq(residents.currentLocation, 'city')));

    const [abroadResult] = await db
      .select({ count: count() })
      .from(residents)
      .where(and(eq(residents.isVisible, true), eq(residents.currentLocation, 'abroad')));

    return {
      total: Number(totalResult.count),
      inVillage: Number(villageResult.count),
      inCity: Number(cityResult.count),
      abroad: Number(abroadResult.count),
    };
  }

  // Admin operations
  async getAllUsers(): Promise<(User & { resident?: Resident })[]> {
    const results = await db
      .select()
      .from(users)
      .leftJoin(residents, eq(users.id, residents.userId))
      .orderBy(desc(users.createdAt));

    const userMap = new Map<string, User & { resident?: Resident }>();

    for (const result of results) {
      const userId = result.users.id;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          ...result.users,
          resident: result.residents || undefined,
        });
      }
    }

    return Array.from(userMap.values());
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async deleteUser(userId: string): Promise<void> {
    // Delete resident first due to foreign key constraint
    await db.delete(residents).where(eq(residents.userId, userId));
    await db.delete(users).where(eq(users.id, userId));
  }
}

export const storage = new DatabaseStorage();
