    import { useEffect, useState } from "react";
    import { forgotPassword, loginUser } from "../../services/authentication.service";
    import { Link, useNavigate } from "react-router-dom";
    import StatusBar from "../../components/StatusBar/StatusBar";
    import ThemeToggle from "../../components/ThemeToggle/ThemeToggle";

    function Login() {
        const [formData, setFormData] = useState({
            email: "",
            password: ""
        });
        const navigate = useNavigate();
        const [loading, setLoading] = useState(false);
        const [_error, setError] = useState("");
        const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error", message: string } | null>(null);
        const [validationErrors, setValidationErrors] = useState<{
            email?: string;
            password?: string;
        }>({});

        //To automatically clear status messages after 3 seconds
        useEffect(() => {
            if (!statusMessage) return
        
            const t = setTimeout(() => setStatusMessage(null), 3000)
            return () => clearTimeout(t)
        }, [statusMessage])

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        //email validation for forgot password
        const validateEmail = (email: string) => {
            if (!email) return "Email is required";
            if (!/^\S+@\S+\.\S+$/.test(email)) return "Invalid email format";
            return "";
        };

        // Basic client-side validation
        const validate = () => {
            const errors: { email?: string; password?: string } = {};

            if (!formData.email) {
                errors.email = "Email is required";
            } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
                errors.email = "Invalid email format";
            }

            if (!formData.password) {
                errors.password = "Password is required";
            } else if (formData.password.length < 6) {
                errors.password = "Password must be at least 6 characters";
            } else if (formData.password.length > 100) {
                errors.password = "Password must be less than 100 characters";
            } else if (!/[A-Z]/.test(formData.password)) {
                errors.password = "Password must contain at least one uppercas letter";
            } else if (!/[a-z]/.test(formData.password)) {
                errors.password = "Password must contain at least one lowercase letter";
            } else if (!/[0-9]/.test(formData.password)) {
                errors.password = "Password must contain at least one number";
            } else if (!/[!@#$%^&*]/.test(formData.password)) {
                errors.password = "Password must contain at least one special character (!@#$%^&*)";
            }

            setValidationErrors(errors);
            return Object.keys(errors).length === 0;
        };

        //login handler
        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            
            if (!validate()) {
                setStatusMessage({ type: "error", message: validationErrors.email || validationErrors.password || "Please fix the errors" });
                return;
            }

            try {
                setLoading(true);
                setError("");

                await loginUser(formData.email, formData.password);

                setStatusMessage({ type: "success", message: "Login successful!" });
                navigate("/dashboard", { replace: true });
            } catch (err: any) {
                const message =  err.response?.data?.message || "Login failed. Please try again.";
                setError(message);
                setStatusMessage({ type: "error", message });
            } finally {
                setLoading(false);
            }
        }

        //forgot password l ink handler
        const handleForgotPassword = async () => {
            const emailError = validateEmail(formData.email);

            if (emailError) {
                setStatusMessage({ type: "error", message: emailError });
                return;
            }

            try {
                await forgotPassword(formData.email);

                setStatusMessage({
                    type: "success",
                    message: "If email exists, password reset link sent to your email",
                });

            } catch (err: any) {
                const message =  err.response?.data?.message || "Something went wrong";

                setStatusMessage({ type: "error", message });
            } 
        }

        return (
            <div className="min-h-screen flex  bg-white text-gray-900 dark:bg-neutral-950 dark:text-gray-100">
                <ThemeToggle className="absolute top-4 right-4 z-20" />
                <div className="hidden md:flex w-1/2 bg-gray-100 text-gray-900 dark:bg-neutral-900 dark:text-gray-100 p-10 flex-col justify-center gap-6 relative">
                    <div className="absolute top-6 left-6 flex items-center gap-2">
                        {/* <img src="/logo.svg" alt="logo" className="w-8 h-8" /> */}
                        <span className="text-lg font-bold tracking-wide">
                            <span>Database</span>
                            <span className="text-blue-400">Dump</span>
                        </span>
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold">
                            Welcome back to your data
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Access your backups, monitor jobs, and restore databases in seconds- all under your control
                        </p>
                    </div>

                    <div className="space-y-4">

                        <div className="bg-gray-200 dark:bg-neutral-800 p-4 rounded-xl">
                        <h3 className="font-semibold">Secure Access</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Secure access with end-to-end encryption
                        </p>
                        </div>

                        <div className="bg-gray-200 dark:bg-neutral-800 p-4 rounded-xl">
                        <h3 className="font-semibold">Real-Time Monitoring</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Monitor backup jobs in real-time.
                        </p>
                        </div>

                        <div className="bg-gray-200 dark:bg-neutral-800 p-4 rounded-xl">
                        <h3 className="font-semibold">One-Click Restoration</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Restore databases with one click.
                        </p>
                        </div>

                    </div>

                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="md:hidden absolute top-6 left-6 flex items-center gap-2">
                        <img src="/logo.svg" alt="logo" className="w-8 h-8" />
                        <span className="text-lg font-bold tracking-wide">
                            <span>Your</span>
                            <span className="text-blue-400">Brand</span>
                        </span>
                    </div>

                    <div className="w-full max-w-md md:bg-white md:dark:bg-neutral-900 md:p-8 md:rounded-2xl md:shadow-lg p-4 md:mx-6">
                        
                        <form onSubmit={handleSubmit}> 
                            <h1 className="text-center text-3xl font-bold mb-6">Login</h1>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">
                                    Email
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    className="w-full bg-gray-200 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="mb-2">
                                <label className="block text-sm font-medium mb-1">
                                    Password
                                </label>
                                <input
                                    name="password"
                                    type="password"
                                    className="w-full bg-gray-200 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="flex justify-end mb-4" onClick={handleForgotPassword}>
                                <a href="#" className="text-sm text-blue-500 hover:underline">
                                    Forgot Password?
                                </a>
                            </div>


                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors cursor-pointer disabled:bg-blue-500/50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-70"
                            >
                                {loading ? "Logging in..." : "Login"}
                            </button>

                            <p className="text-center text-sm mt-4">
                                Don’t have an account?{" "}
                                <Link to="/register" className="text-blue-500 cursor-pointer hover:underline">
                                    Sign up
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>

                {statusMessage && (
                    <StatusBar
                        type={statusMessage.type}
                        message={statusMessage.message}
                        onClose={() => setStatusMessage(null)}
                    />
                )}
            </div>
        );
    }

    export default Login;