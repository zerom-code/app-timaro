
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { APP_VERSION } from '@/constants/version';
import { Button } from '@/components/ui/button';
import { Download, AlertTriangle } from 'lucide-react';

interface VersionGuardProps {
    children: React.ReactNode;
}

const VersionGuard: React.FC<VersionGuardProps> = ({ children }) => {
    const [isOutdated, setIsOutdated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [updateUrl, setUpdateUrl] = useState('');

    useEffect(() => {
        const checkVersion = async () => {
            try {
                const configRef = doc(db, 'app_config', 'settings');
                const configSnap = await getDoc(configRef);

                if (configSnap.exists()) {
                    const data = configSnap.data();
                    const minVersion = data.minVersion || '1.0.0';
                    const url = data.updateUrl || '';
                    
                    setUpdateUrl(url);

                    // Simple version comparison (1.2.1 < 1.3.0)
                    if (isVersionOlder(APP_VERSION, minVersion)) {
                        setIsOutdated(true);
                    }
                }
            } catch (error) {
                console.error("Error checking app version:", error);
                // If error (e.g. no internet), allow the app to function
            } finally {
                setLoading(false);
            }
        };

        checkVersion();
    }, []);

    // Function to compare versions like "1.2.1"
    const isVersionOlder = (current: string, minRequired: string) => {
        const currParts = current.split('.').map(Number);
        const minParts = minRequired.split('.').map(Number);

        for (let i = 0; i < Math.max(currParts.length, minParts.length); i++) {
            const curr = currParts[i] || 0;
            const min = minParts[i] || 0;
            if (curr < min) return true;
            if (curr > min) return false;
        }
        return false;
    };

    if (loading) {
        return null; // Or a light spinner
    }

    if (isOutdated) {
        return (
            <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="w-10 h-10 text-orange-600" />
                </div>
                
                <h1 className="text-2xl font-bold mb-2">Оновлення обов'язкове</h1>
                <p className="text-text-light mb-8 max-w-xs">
                    Ваша версія додатка ({APP_VERSION}) застаріла та більше не підтримується. Будь ласка, встановіть нову версію.
                </p>

                {updateUrl ? (
                    <Button 
                        className="w-full max-w-xs bg-primary hover:bg-primary-dark h-12"
                        onClick={() => window.open(updateUrl, '_blank')}
                    >
                        <Download className="w-5 h-5 mr-2" />
                        Завантажити оновлення
                    </Button>
                ) : (
                    <p className="text-sm text-text-muted italic">
                        Зверніться до адміністратора для отримання нового файлу.
                    </p>
                )}
                
                <p className="mt-10 text-[10px] text-text-muted uppercase tracking-widest">
                    Shawarma TiMaRo Security System
                </p>
            </div>
        );
    }

    return <>{children}</>;
};

export default VersionGuard;
