import React, { useState, useEffect, useRef } from "react";
import { Card, Input, Button } from "@nextui-org/react";
import * as THREE from "three";
import BIRDS from "vanta/dist/vanta.birds.min";
import { loginUser, registerUser } from "../services/api";
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const isLogin = location.pathname === "/login";
    //background
    const vantaRef = useRef(null);
    useEffect(() => {
      //init background effect
      const effect = BIRDS({
        el: vantaRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color1: 0x722ed1,
        color2: 0xffc0cb,
        backgroundColor: 0xffffff
      });

    // clear background
    return () => {
      if (effect) effect.destroy();
    };
  }, []);

  useEffect(() => {
    if (isLogin) {
      setFormData({ email: "", name: "", password: "", confirmPassword: "" });
    }
  }, [isLogin]);

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: ""
  });

    // validate Email
    const validateEmail = (value) => value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);
    const isInvalid = React.useMemo(() => {
        if (formData.email === "") return false;

        return validateEmail(formData.email) ? false : true;
    }, [formData.email]);

    // validate comfirmPassword
    const isPasswordMatch = React.useMemo(() => {
        return formData.password === formData.confirmPassword;
    }, [formData.password, formData.confirmPassword]);

    const toggleAuthMode = () => {
        navigate(isLogin ? "/register" : "/login")
        setFormData({ email: "", name: "", password: "", confirmPassword: "" });
    };
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSubmit();
        }
    };

    // login register
    const handleSubmit = async () => {
        try {
            // no empty
            if (!formData.email || !formData.password || (!isLogin && (!formData.name || !formData.confirmPassword))) {
                toast.error("All fields are required.");
                return;
            }
            // check password match
            if (!isLogin && formData.password !== formData.confirmPassword) {
                toast.error("Passwords do not match");
                return;
            }
            if (isLogin) {
                const response = await loginUser({ email: formData.email, password: formData.password });
                toast.success('Login successful!')
                localStorage.setItem('token', response.token)
                navigate('/dashboard');
            } else {
                const response = await registerUser({ email: formData.email, name: formData.name, password: formData.password });
                toast.success('Register successful!')
                navigate('/login');
            }
        } catch (error) {
            toast.error(isLogin ? "Login failed. Please try again." : "Registration failed. Please try again.")
        }
    };

    return (
        <div ref={vantaRef} className="flex items-center justify-center w-screen h-screen ">
            <div className="flex w-full overflow-hidden rounded-lg shadow-lg">

                {/* slogan */}
                <div className="flex-col items-center justify-center hidden w-1/2 p-8 md:flex">
                    <h1 className="mb-4 text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">Welcome to Presto!</h1>
                    <p className="text-lg">Join us and start your journey with our amazing platform.</p>
                </div>

                <div className="flex items-center justify-center w-full h-screen md:w-1/2">
                    <Card isBlurred className="w-full max-w-md p-6 bg-transparent">
                        <h2 className="text-2xl font-semibold text-center">{isLogin ? "Login" : "Register"}</h2>

                        <div className="flex flex-wrap w-full gap-4 mt-4 md:flex-nowrap">
                            <Input type="email" name="email" label="Email" onChange={handleChange} value={formData.email}
                                isInvalid={isInvalid}
                                color={isInvalid ? "danger" : "secondary"}
                                onKeyDown={handleKeyDown}
                                errorMessage="Please enter a valid email"
                            />
                        </div>

                        {!isLogin && (
                            <div className="flex flex-wrap w-full gap-4 mt-4 md:flex-nowrap">
                                <Input
                                    clearable
                                    underlined
                                    fullWidth
                                    name="name"
                                    color="secondary"
                                    label="Name"
                                    onChange={handleChange}
                                    onKeyDown={handleKeyDown}
                                    value={formData.name}
                                    type="text"
                                />
                            </div>
                        )}

                        <div className="flex flex-wrap w-full gap-4 mt-4 md:flex-nowrap">
                            <Input type="password" name="password" color="secondary" label="Password" onChange={handleChange} value={formData.password} onKeyDown={handleKeyDown}/>
                        </div>

                        {!isLogin && (
                            <div className="flex flex-wrap w-full gap-4 mt-4 md:flex-nowrap">
                                <Input
                                    clearable
                                    underlined
                                    fullWidth
                                    name="confirmPassword"
                                    color={!isPasswordMatch ? "danger" : "secondary"}
                                    label="Comfirm Password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    onKeyDown={handleKeyDown}
                                    type="password"
                                    isInvalid={!isPasswordMatch && formData.confirmPassword !== ""}
                                    errorMessage={!isPasswordMatch ? "Passwords do not match" : ""}
                                />
                            </div>
                        )}

                        <div className="mt-6">
                            <Button shadow color="primary" auto className="w-full bg-gradient-to-r from-pink-500 to-violet-500" onClick={handleSubmit}>
                                {isLogin ? "Login" : "Register"}
                            </Button>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-sm">
                                {isLogin ? "No account?" : "Have an account?"}
                                <Button auto variant="light" color="primary" onClick={toggleAuthMode} className="ml-1">
                                    {isLogin ? "Register" : "Login"}
                                </Button>
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}