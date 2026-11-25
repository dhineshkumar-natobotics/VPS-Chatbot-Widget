export declare function useCopyText(): {
    status: "idle" | "copying" | "copied" | "failed";
    copy: (text: string) => Promise<void>;
};
