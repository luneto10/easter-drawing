export const joinScreenTransition = {
    duration: 0.55,
    ease: [0.22, 1, 0.36, 1] as const,
};

export const joinScreenVariants = {
    initial: {
        opacity: 0,
        y: 24,
        filter: "blur(6px)",
    },
    animate: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: joinScreenTransition,
    },
};
