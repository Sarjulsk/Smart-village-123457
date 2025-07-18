import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertResidentSchema, updateResidentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Resident routes
  app.get('/api/residents', isAuthenticated, async (req: any, res) => {
    try {
      const { location, search, occupation, returning, awayLong } = req.query;
      const filters = {
        location: location as string,
        search: search as string,
        occupation: occupation as string,
        returning: returning === 'true',
        awayLong: awayLong === 'true',
      };
      
      const residents = await storage.getResidents(filters);
      res.json(residents);
    } catch (error) {
      console.error("Error fetching residents:", error);
      res.status(500).json({ message: "Failed to fetch residents" });
    }
  });

  app.get('/api/residents/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const resident = await storage.getResidentByUserId(userId);
      res.json(resident);
    } catch (error) {
      console.error("Error fetching user resident:", error);
      res.status(500).json({ message: "Failed to fetch resident profile" });
    }
  });

  app.get('/api/residents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const resident = await storage.getResident(id);
      if (!resident) {
        return res.status(404).json({ message: "Resident not found" });
      }
      res.json(resident);
    } catch (error) {
      console.error("Error fetching resident:", error);
      res.status(500).json({ message: "Failed to fetch resident" });
    }
  });

  app.post('/api/residents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertResidentSchema.parse({
        ...req.body,
        userId,
      });
      
      const resident = await storage.createResident(validatedData);
      res.status(201).json(resident);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating resident:", error);
      res.status(500).json({ message: "Failed to create resident" });
    }
  });

  app.put('/api/residents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user owns this resident or is admin
      const resident = await storage.getResident(id);
      if (!resident) {
        return res.status(404).json({ message: "Resident not found" });
      }
      
      if (resident.userId !== userId && user?.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to update this resident" });
      }
      
      const validatedData = updateResidentSchema.parse(req.body);
      const updatedResident = await storage.updateResident(id, validatedData);
      res.json(updatedResident);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating resident:", error);
      res.status(500).json({ message: "Failed to update resident" });
    }
  });

  app.delete('/api/residents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user owns this resident or is admin
      const resident = await storage.getResident(id);
      if (!resident) {
        return res.status(404).json({ message: "Resident not found" });
      }
      
      if (resident.userId !== userId && user?.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to delete this resident" });
      }
      
      await storage.deleteResident(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting resident:", error);
      res.status(500).json({ message: "Failed to delete resident" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/stats', isAuthenticated, async (req: any, res) => {
    try {
      const stats = await storage.getTotalStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  app.get('/api/analytics/location', isAuthenticated, async (req: any, res) => {
    try {
      const stats = await storage.getLocationStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching location stats:", error);
      res.status(500).json({ message: "Failed to fetch location statistics" });
    }
  });

  app.get('/api/analytics/occupation', isAuthenticated, async (req: any, res) => {
    try {
      const stats = await storage.getOccupationStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching occupation stats:", error);
      res.status(500).json({ message: "Failed to fetch occupation statistics" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/admin/users/:userId/role', isAuthenticated, async (req: any, res) => {
    try {
      const targetUserId = req.params.userId;
      const { role } = req.body;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const updatedUser = await storage.updateUserRole(targetUserId, role);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.delete('/api/admin/users/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const targetUserId = req.params.userId;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      if (targetUserId === userId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      await storage.deleteUser(targetUserId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Data export route
  app.get('/api/export/residents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const residents = await storage.getResidents();
      
      // Convert to CSV format
      const headers = [
        'Name', 'Age', 'Gender', 'Phone', 'House Number', 'Current Location',
        'City', 'Country', 'Departure Date', 'Expected Return', 'Occupation', 'Company'
      ];
      
      const csvData = [
        headers.join(','),
        ...residents.map(r => [
          `"${r.fullName}"`,
          r.age,
          r.gender,
          `"${r.phoneNumber}"`,
          `"${r.houseNumber}"`,
          r.currentLocation,
          `"${r.currentCity || ''}"`,
          `"${r.currentCountry || ''}"`,
          r.departureDate || '',
          r.expectedReturnDate || '',
          r.occupation,
          `"${r.company || ''}"`
        ].join(','))
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="village_residents.csv"');
      res.send(csvData);
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
