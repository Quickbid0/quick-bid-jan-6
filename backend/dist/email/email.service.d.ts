export declare class EmailService {
    private transporter;
    constructor();
    sendVerificationEmail(email: string, verificationToken: string): Promise<void>;
    sendOTPEmail(email: string, otp: string): Promise<void>;
    sendPasswordResetEmail(email: string, resetToken: string): Promise<void>;
}
