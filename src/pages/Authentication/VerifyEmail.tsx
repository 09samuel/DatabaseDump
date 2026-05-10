import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { verifyEmail } from "../../services/authentication.service";
import ThemeToggle from "../../components/ThemeToggle/ThemeToggle";

function VerifyEmail() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState("verifying");
    // possible values:
    // "verifying" | "success" | "error"

    const [message, setMessage] = useState("Verifying your email...");

    useEffect(() => {
        const verify = async () => {
            try {
                if (!token) {
                    throw new Error("Invalid verification token.");
                }

                await verifyEmail(token);

                setStatus("success");
                setMessage("Your email has been verified successfully.");

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate("/login", { replace: true });
                }, 3000);
            } catch (error: any) {
                setStatus("error");
                setMessage(
                    error?.response?.data?.message || "Email verification failed. The link may be invalid or expired."
                );
            }
        };

        verify();
    }, [token, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white text-gray-900 dark:bg-neutral-950 dark:text-gray-100 px-6">
            <ThemeToggle className="absolute top-4 right-4 z-20" />

            <div className="max-w-md w-full bg-white dark:bg-neutral-900 rounded-xl shadow-lg dark:shadow-black/30 p-8 text-center border border-gray-200 dark:border-neutral-800">
            <h1 className="text-2xl font-bold mb-4">
                Verify Your Email
            </h1>

            {status === "verifying" && (
                <p className="text-gray-600 dark:text-gray-400">
                Verifying your email...
                </p>
            )}

            {status === "success" && (
                <>
                <p className="text-green-600 dark:text-green-400 font-medium mb-2">
                    {message}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Redirecting to login...
                </p>
                </>
            )}

            {status === "error" && (
                <>
                <p className="text-red-600 dark:text-red-400 font-medium mb-4">
                    {message}
                </p>
                <button
                    onClick={() => navigate("/login")}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                    Go to Login
                </button>
                </>
            )}
            </div>
        </div>
    );
}

export default VerifyEmail;