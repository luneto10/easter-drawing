export const STORAGE_KEY = "brasa-easter-giver-id";

export const screenTransition = {
    duration: 0.55,
    ease: [0.22, 1, 0.36, 1] as const,
};

export const screenVariants = {
    initial: {
        opacity: 0,
        y: 24,
        filter: "blur(6px)",
    },
    animate: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: screenTransition,
    },
    exit: {
        opacity: 0,
        y: -18,
        filter: "blur(4px)",
        transition: {
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1] as const,
        },
    },
};

export const backButtonVariants = {
    initial: { opacity: 0, y: -8 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1] as const,
            delay: 0.12,
        },
    },
    exit: {
        opacity: 0,
        y: -8,
        transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
    },
};
