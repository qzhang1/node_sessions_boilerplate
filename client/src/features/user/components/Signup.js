import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import toast from "react-hot-toast";

import { signupUser } from "../userSlice";
import { useEffect } from "react";

const Signup = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  return <h3>Sign Up</h3>;
};

export default Signup;
