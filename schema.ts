import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  date,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user").notNull(), // 'admin' or 'user'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Residents table for village people management
export const residents = pgTable("residents", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  fullName: varchar("full_name").notNull(),
  age: integer("age").notNull(),
  gender: varchar("gender").notNull(), // 'male', 'female', 'other'
  phoneNumber: varchar("phone_number").notNull(),
  houseNumber: varchar("house_number").notNull(), // House Number / Tola
  currentLocation: varchar("current_location").notNull(), // 'village', 'city', 'abroad'
  currentCity: varchar("current_city"), // Specific city if not in village
  currentCountry: varchar("current_country"), // Specific country if abroad
  departureDate: date("departure_date"), // When they left village
  expectedReturnDate: date("expected_return_date"), // When they expect to return
  occupation: varchar("occupation").notNull(), // 'student', 'job', 'business', 'farming', 'unemployed'
  company: varchar("company"), // Company or Institution
  workSector: varchar("work_sector"), // IT, Construction, etc.
  workDetails: text("work_details"), // Additional work information
  isVisible: boolean("is_visible").default(true), // Privacy setting
  showPhone: boolean("show_phone").default(false), // Privacy setting
  showLocation: boolean("show_location").default(true), // Privacy setting
  showReturnDate: boolean("show_return_date").default(true), // Privacy setting
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  resident: one(residents, {
    fields: [users.id],
    references: [residents.userId],
  }),
}));

export const residentsRelations = relations(residents, ({ one }) => ({
  user: one(users, {
    fields: [residents.userId],
    references: [users.id],
  }),
}));

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertResidentSchema = createInsertSchema(residents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateResidentSchema = createInsertSchema(residents).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertResident = z.infer<typeof insertResidentSchema>;
export type UpdateResident = z.infer<typeof updateResidentSchema>;
export type Resident = typeof residents.$inferSelect;
export type ResidentWithUser = Resident & { user: User | null };
