import React, { createContext, useContext, useState, useEffect } from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    User,
    updateProfile,
    signInWithCredential
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';
import { createOrUpdateUser, getUserProfile, updateUserProfile } from "@/services/firebaseUserService";
import { claimGuestOrders } from "@/services/firebaseOrderService";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
    user: User | null;
    userProfile: {
        displayName: string | null;
        address: string | null;
        phone: string | null;
        role: string | null;
    } | null;
    isAdmin: boolean;
    loading: boolean;
    register: (email: string, pass: string, name?: string) => Promise<void>;
    login: (email: string, pass: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    updateUserData: (data: { displayName?: string; address?: string; phone?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<AuthContextType['userProfile']>(null);
    const [loading, setLoading] = useState(true);
    const queryClient = useQueryClient();

    // Load user profile when auth state changes
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            setUser(u);
            
            if (u) {
                try {
                    console.log("Auth state changed, user logged in:", u.displayName);
                    
                    // Create or update the user profile in Firestore
                    const profile = await createOrUpdateUser(u);
                    console.log("Loaded user profile:", profile);
                    
                    setUserProfile({
                        displayName: profile.displayName || u.displayName,
                        address: profile.address,
                        phone: profile.phone,
                        role: profile.role
                    });

                    // Claim guest orders if any exist in local storage
                    const guestOrderIds = JSON.parse(localStorage.getItem('shawarma_guest_order_ids') || '[]');
                    if (guestOrderIds.length > 0) {
                        await claimGuestOrders(u.uid, u.email || '', guestOrderIds);
                        queryClient.invalidateQueries({ queryKey: ['orders', u.uid] });
                    }
                } catch (error) {
                    console.error("Error loading user profile:", error);
                    setUserProfile({
                        displayName: u.displayName,
                        address: null,
                        phone: null,
                        role: null
                      });
                }
            } else {
                console.log("Auth state changed, user logged out");
                setUserProfile(null);
            }
            
            setLoading(false);
        });
        
        return () => unsub();
    }, []);

    const register = async (email: string, pass: string, name?: string) => {
        console.log("Registering user:", email, "with name:", name);
        const result = await createUserWithEmailAndPassword(auth, email, pass);
        
        // Set display name if provided
        if (name && result.user) {
            await updateProfile(result.user, { displayName: name });
            console.log("Display name set for new user:", name);
            
            // Also update the Firestore profile
            await createOrUpdateUser({
                ...result.user,
                displayName: name
            });

            // Update local state immediately
            setUserProfile({
                displayName: name,
                address: null,
                phone: null,
                role: null
            });
        }
    };

    const login = (email: string, pass: string) =>
        signInWithEmailAndPassword(auth, email, pass).then(() => {
            console.log("User logged in:", email);
        });

    const loginWithGoogle = async () => {
        try {
            if (Capacitor.isNativePlatform()) {
                // Native login via plugin with explicit clientId
                const result = await (FirebaseAuthentication as any).signInWithGoogle({
                    clientId: '325924082125-4b6aln0skmnf60eog6ap2ouee5q45n6p.apps.googleusercontent.com'
                });
                
                // With skipNativeAuth: true the plugin returns the token in different places depending on the version
                const idToken = result.authentication?.idToken || result.idToken || result.credential?.idToken;
                const accessToken = result.authentication?.accessToken || result.accessToken || result.credential?.accessToken;
                
                if (idToken) {
                    const credential = GoogleAuthProvider.credential(idToken, accessToken);
                    await signInWithCredential(auth, credential);
                    console.log("User logged in with Google Token");
                } else {
                    throw new Error("Не вдалося отримати Google ID Token.");
                }
            } else {
                // Standard browser login
                await signInWithPopup(auth, new GoogleAuthProvider());
                console.log("User logged in with Google Popup");
            }
        } catch (error: any) {
            // Ignore cancellation error as it is often a false positive in Capacitor
            if (error.message && (error.message.includes('cancelled') || error.message.includes('canceled'))) {
                console.log("Google Login was cancelled or returned a false positive cancellation.");
                return;
            }
            console.error("Google Login Error:", error);
            throw error;
        }
    };

    const logoutUser = () => signOut(auth);

    const updateUserData = async (data: { displayName?: string; address?: string; phone?: string }) => {
        if (!user) return;
        
        console.log("Updating user data:", data);
        
        // Update Firebase Auth display name if provided
        if (data.displayName && data.displayName !== user.displayName) {
            await updateProfile(user, { displayName: data.displayName });
            console.log("Updated Firebase Auth display name:", data.displayName);
        }
        
        // Update user profile in Firestore
        const updateData: Record<string, string | null> = {};
        if (data.displayName) updateData.displayName = data.displayName;
        if (data.address !== undefined) updateData.address = data.address || null;
        if (data.phone !== undefined) updateData.phone = data.phone || null;
        
        try {
            // Update Firestore profile
            await updateUserProfile(user.uid, updateData);
            
            // Update local state
            setUserProfile(prev => ({
                ...prev!,
                ...updateData
            }));
            
            // Refresh the user
            await user.reload();
            
            console.log("User data updated successfully");
        } catch (error) {
            console.error("Error updating user data:", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider 
            value={{ 
                user, 
                userProfile,
                isAdmin: userProfile?.role === 'admin',
                loading, 
                register, 
                login, 
                loginWithGoogle, 
                logout: logoutUser,
                updateUserData
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be inside AuthProvider");
    return ctx;
};
