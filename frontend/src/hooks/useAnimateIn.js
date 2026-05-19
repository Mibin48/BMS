import { useState, useEffect } from 'react';

const useAnimateIn = (count, delay = 60) => {
    const [visible, setVisible] = useState([]);

    useEffect(() => {
        setVisible([]);
        const timers = [];
        for (let i = 0; i < count; i++) {
            timers.push(
                setTimeout(() => {
                    setVisible(v => [...v, i]);
                }, i * delay)
            );
        }
        return () => timers.forEach(t => clearTimeout(t));
    }, [count, delay]);

    const isVisible = (i) => visible.includes(i);

    return isVisible;
};

export default useAnimateIn;
