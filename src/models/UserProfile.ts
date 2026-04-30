
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  address: string;
  phone: string;
  isVerified: boolean;
  lastLogin: Date;
}

export const createUserProfile = (
  id: string,
  email: string,
  displayName: string,
  address: string = "",
  phone: string = ""
): UserProfile => ({
  id,
  email,
  displayName,
  address,
  phone,
  isVerified: false,
  lastLogin: new Date()
});
