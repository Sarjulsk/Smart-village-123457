import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertResidentSchema, type InsertResident, type Resident } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PersonFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resident?: Resident;
  mode: 'create' | 'edit';
}

const formSchema = insertResidentSchema.omit({ userId: true });

export default function PersonForm({ open, onOpenChange, resident, mode }: PersonFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<Omit<InsertResident, 'userId'>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: resident?.fullName || "",
      age: resident?.age || 18,
      gender: resident?.gender || "male",
      phoneNumber: resident?.phoneNumber || "",
      houseNumber: resident?.houseNumber || "",
      currentLocation: resident?.currentLocation || "village",
      currentCity: resident?.currentCity || "",
      currentCountry: resident?.currentCountry || "",
      departureDate: resident?.departureDate || undefined,
      expectedReturnDate: resident?.expectedReturnDate || undefined,
      occupation: resident?.occupation || "unemployed",
      company: resident?.company || "",
      workSector: resident?.workSector || "",
      workDetails: resident?.workDetails || "",
      isVisible: resident?.isVisible ?? true,
      showPhone: resident?.showPhone ?? false,
      showLocation: resident?.showLocation ?? true,
      showReturnDate: resident?.showReturnDate ?? true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<InsertResident, 'userId'>) => {
      await apiRequest('POST', '/api/residents', data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/residents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/residents/me'] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create profile",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Omit<InsertResident, 'userId'>) => {
      await apiRequest('PUT', `/api/residents/${resident?.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/residents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/residents/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/residents', resident?.id] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: Omit<InsertResident, 'userId'>) => {
    if (mode === 'create') {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Profile' : 'Edit Profile'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter full name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        placeholder="Enter age" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter phone number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="houseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>House Number / Tola *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter house number or area" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Location *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="village">In Village</SelectItem>
                        <SelectItem value="city">In City</SelectItem>
                        <SelectItem value="abroad">Abroad</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('currentLocation') === 'city' && (
                <FormField
                  control={form.control}
                  name="currentCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current City</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter current city" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {form.watch('currentLocation') === 'abroad' && (
                <FormField
                  control={form.control}
                  name="currentCountry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Country</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter current country" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="occupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Occupation *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select occupation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="job">Job</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="farming">Farming</SelectItem>
                        <SelectItem value="unemployed">Unemployed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company/Institution</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter company or institution" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workSector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Sector</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., IT, Construction, Healthcare" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="departureDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departure Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedReturnDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Return Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="workDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Details</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Additional work information"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h4 className="text-base font-medium text-slate-900">Privacy Settings</h4>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="showLocation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Show my current location to others</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="showPhone"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Show my phone number to others</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="showReturnDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Show my expected return date</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isVisible"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Make my profile visible to others</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : mode === 'create' ? 'Create Profile' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
