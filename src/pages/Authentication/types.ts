export type AuthMessageResponse = {
    success: boolean;
    message: string;
    errors?: Record<string, string>;
};

export type MeResponse = {
    success: boolean;
    data: {
        userId: string;
    };
};

export type UserInfoResponse = {
    success: boolean;
    data: {
        id: string;
        name: string;
        email: string;
    };
};