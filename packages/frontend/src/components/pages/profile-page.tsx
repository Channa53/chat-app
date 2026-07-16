import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_REGEX,
} from '@chat-app/shared/utils/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, UserCircle } from 'lucide-react';
import { type FC, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button, Input } from '@/design-system';
import { updateMe, uploadAvatar } from '@/services/user-service';
import { useAuthStore } from '@/stores/auth-store';
import { ApiClientError } from '@/utils/api-client';

const profileSchema = z.object({
  username: z
    .string()
    .min(USERNAME_MIN_LENGTH, `At least ${USERNAME_MIN_LENGTH} characters`)
    .max(USERNAME_MAX_LENGTH, `At most ${USERNAME_MAX_LENGTH} characters`)
    .regex(USERNAME_REGEX, 'Letters, numbers, dash, underscore only'),
});

type ProfileValues = z.infer<typeof profileSchema>;

export const ProfilePage: FC = () => {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { username: user?.username ?? '' },
  });

  if (!user) return null;

  const onSubmit = async (values: ProfileValues): Promise<void> => {
    setServerError(null);
    setSuccessMessage(null);
    try {
      const updated = await updateMe({ username: values.username });
      setUser(updated);
      setSuccessMessage('Profile updated');
    } catch (err) {
      setServerError(err instanceof ApiClientError ? err.message : 'Unexpected error');
    }
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;
    setServerError(null);
    setSuccessMessage(null);
    setUploading(true);
    try {
      const updated = await uploadAvatar(file);
      setUser(updated);
      setSuccessMessage('Avatar updated');
    } catch (err) {
      setServerError(err instanceof ApiClientError ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 items-center border-b border-border px-4">
        <h1 className="text-sm font-semibold">Profile</h1>
      </header>

      <div className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-md space-y-8">
          <section className="flex items-center gap-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="h-20 w-20 rounded-full border border-border object-cover"
              />
            ) : (
              <UserCircle className="h-20 w-20 text-muted-foreground" />
            )}

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? 'Uploading…' : 'Change avatar'}
              </Button>
              <p className="text-xs text-muted-foreground">JPEG, PNG, or WebP, up to 2MB.</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => void onAvatarChange(e)}
              />
            </div>
          </section>

          <form
            onSubmit={(e) => void handleSubmit(onSubmit)(e)}
            className="space-y-4 rounded-lg border border-border bg-surface p-6"
          >
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input id="email" value={user.email} disabled />
              <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>

            <div className="space-y-1">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                invalid={Boolean(errors.username)}
                {...register('username')}
              />
              {errors.username && (
                <p className="text-xs text-destructive">{errors.username.message}</p>
              )}
            </div>

            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
            {successMessage && <p className="text-sm text-primary">{successMessage}</p>}

            <Button type="submit" disabled={!isDirty || isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save changes'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
