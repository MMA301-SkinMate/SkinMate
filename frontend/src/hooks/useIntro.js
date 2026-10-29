import { useState, useEffect } from 'react';
import { introStorage } from '../services/introStorage';

export const useIntro = () => {
    const [isCheckingIntro, setIsCheckingIntro] = useState(true);
    const [hasSeenIntro, setHasSeenIntro] = useState(false);

    useEffect(() => {
        const checkIntroStatus = async () => {
            try {
                const seen = await introStorage.getHasSeenIntro();
                setHasSeenIntro(seen);
            } catch (error) {
                console.log('Error reading intro status:', error);
            } finally {
                setIsCheckingIntro(false);
            }
        };

        checkIntroStatus();
    }, []);

    const handleFinishIntro = async () => {
        try {
            await introStorage.setHasSeenIntro();
            setHasSeenIntro(true);
        } catch (error) {
            console.log('Error saving intro status:', error);
        }
    };

    return {
        isCheckingIntro,
        hasSeenIntro,
        handleFinishIntro,
    };
};