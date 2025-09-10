import type React from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  type AvailabilityOption,
  type UserUpdateFormValues,
  AVAILABILITY_OPTIONS,
  SHIRT_SIZES,
  userUpdateSchema,
} from "@/schemas/userUpdateSchema";
import { useAuth } from "@/contexts/AuthContext";
import { del, patch } from "@/services/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const UserSettings: React.FC = () => {
  const navigate = useNavigate();
  const { user, checkAuthStatus } = useAuth();

  const form = useForm<UserUpdateFormValues>({
    resolver: zodResolver(userUpdateSchema),
    mode: "onChange",
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      team_name: user?.team_name ?? "",
      availability:
        (user?.availability as AvailabilityOption[] | undefined) ?? [],
      shirt_size:
        (user?.shirt_size as UserUpdateFormValues["shirt_size"]) ??
        SHIRT_SIZES[0],
      dietary_restrictions: user?.dietary_restrictions ?? "",
      notes: user?.notes ?? "",
      can_take_photos: user?.can_take_photos ?? true,
    },
  });

  const onSubmit = async (data: UserUpdateFormValues) => {
    try {
      await patch("/users/edit_user", data);
      await checkAuthStatus();
      toast.success("Settings saved", {
        description: "Your profile has been updated.",
      });
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast.error("Save failed", { description: "Please try again." });
    }
  };

  const confirmDelete = async () => {
    const t = toast.loading("Deleting account…", { duration: Infinity });
    try {
      await del<void>("/users/delete_user");
      await checkAuthStatus();
      toast.success("Account deleted", { id: t, description: "Goodbye." });
      navigate("/login", { replace: true });
    } catch (e: any) {
      toast.error("Delete failed", {
        id: t,
        description: e?.message || "Please try again.",
      });
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h2 className="text-3xl font-bold text-stone-300">SETTINGS</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] uppercase tracking-[0.18em] text-stone-400/90 font-mono">
                  Full Name
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-stone-900/50 hover:bg-stone-950/50 border-stone-800 text-stone-300 placeholder:text-stone-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] uppercase tracking-[0.18em] text-stone-400/90 font-mono">
                  Email Address
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    className="bg-stone-900/50 hover:bg-stone-950/50 border-stone-800 text-stone-300 placeholder:text-stone-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="team_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] uppercase tracking-[0.18em] text-stone-400/90 font-mono">
                  Team Request
                </FormLabel>
                <FormMessage className="text-xs text-stone-400">
                  Only 4 plinkterns per team. If unsure, leave blank and staff
                  will place you.
                </FormMessage>
                <FormControl>
                  <Input
                    className="bg-stone-900/50 hover:bg-stone-950/50 border-stone-800 text-stone-300 placeholder:text-stone-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="availability"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] uppercase tracking-[0.18em] text-stone-400/90 font-mono">
                  Availability
                </FormLabel>
                <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {AVAILABILITY_OPTIONS.map((day) => (
                    <label
                      key={day}
                      className="flex items-center gap-3 rounded-md border border-stone-800 bg-stone-900/50 px-3 py-2 hover:bg-stone-950/50"
                    >
                      <Checkbox
                        className="border-stone-600 data-[state=checked]:text-[hsl(var(--primary))]"
                        checked={field.value?.includes(day)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...(field.value || []), day]);
                          } else {
                            field.onChange(
                              (field.value || []).filter((v) => v !== day),
                            );
                          }
                        }}
                      />
                      <span className="text-stone-300">{day}</span>
                    </label>
                  ))}
                </div>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shirt_size"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] uppercase tracking-[0.18em] text-stone-400/90 font-mono">
                  T-Shirt Size
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                    className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-3"
                  >
                    {SHIRT_SIZES.map((size) => (
                      <FormItem
                        key={size}
                        className="flex items-center gap-3 rounded-md border border-stone-800 bg-stone-900/50 px-3 py-2 hover:bg-stone-950/50"
                      >
                        <RadioGroupItem
                          value={size}
                          id={`shirt-${size}`}
                          className="border-stone-600 data-[state=checked]:text-[hsl(var(--primary))]"
                        />
                        <FormLabel
                          htmlFor={`shirt-${size}`}
                          className="m-0 cursor-pointer text-stone-300"
                        >
                          {size}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dietary_restrictions"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] uppercase tracking-[0.18em] text-stone-400/90 font-mono">
                  Dietary Restrictions
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-[100px] bg-stone-900/50 hover:bg-stone-950/50 border-stone-800 text-stone-300 placeholder:text-stone-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] uppercase tracking-[0.18em] text-stone-400/90 font-mono">
                  Notes
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-[100px] bg-stone-900/50 hover:bg-stone-950/50 border-stone-800 text-stone-300 placeholder:text-stone-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="can_take_photos"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start gap-3 rounded-md border border-stone-800 bg-stone-900/50 p-3 hover:bg-stone-950/50">
                <FormControl>
                  <Checkbox
                    className="border-stone-600 data-[state=checked]:text-[hsl(var(--primary))]"
                    checked={!field.value}
                    onCheckedChange={(checked) => field.onChange(!checked)}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-stone-300">
                    I do not consent to photos
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            variant="outline"
            className="w-full font-semibold text-stone-300 border-stone-800 bg-stone-900/50 hover:bg-stone-950/50"
          >
            {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Form>

      <div className="rounded-xl border border-stone-800/80 bg-stone-900/60 p-4 cyber-ring">
        <h3 className="text-lg font-semibold text-white">Danger zone</h3>
        <p className="mt-1 text-sm text-stone-400">
          Permanently delete your account and data.
        </p>
        <div className="mt-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="text-white border-stone-800 hover:bg-stone-950/60"
              >
                Delete account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. Your account and data will be
                  permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
