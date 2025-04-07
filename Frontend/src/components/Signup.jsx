import React, { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";

const Signup = () => {
  const { user } = useSelector((store) => store.auth);
  const [input, setInput] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const signupHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/register`,
        input,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        navigate("/login");
        toast.success(res.data.message);
        setInput({
          fullname: "",
          email: "",
          password: "",
          phoneNumber: "",
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, []);

  return (
    <div className="flex items-center w-screen h-screen justify-center">
      <form
        className="shadow-lg flex flex-col gap-3 p-8"
        onSubmit={signupHandler}
      >
        <div className="my-2 flex flex-col items-center">
          <img src="/logo.svg" alt="logo" className="w-10" />
          <p className="text-sm text-center">
            Sign up to discover moments shared by your friends.
          </p>
        </div>
        <div>
          <span className="font-medium">Fullname</span>
          <Input
            type="text"
            name="fullname"
            onChange={changeEventHandler}
            value={input.fullname}
            className="focus-visible:ring-transparent my-1"
          />
        </div>
        <div>
          <span className="font-medium">Email</span>
          <Input
            type="email"
            name="email"
            onChange={changeEventHandler}
            value={input.email}
            className="focus-visible:ring-transparent my-1"
          />
        </div>
        <div>
          <span className="font-medium">Phone Number</span>
          <Input
            type="text"
            name="phoneNumber"
            onChange={changeEventHandler}
            value={input.phoneNumber}
            className="focus-visible:ring-transparent my-1"
          />
        </div>
        <div>
          <span className="font-medium">Password</span>
          <Input
            type="password"
            name="password"
            onChange={changeEventHandler}
            value={input.password}
            className="focus-visible:ring-transparent my-1"
          />
        </div>
        {loading ? (
          <Button>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please Wait
          </Button>
        ) : (
          <Button type="submit">Signup</Button>
        )}
        <span className="text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600">
            Login
          </Link>
        </span>
      </form>
    </div>
  );
};

export default Signup;