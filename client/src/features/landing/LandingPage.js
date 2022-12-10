import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { userSelector, logoutUser, fetchUserProfile } from "../user/userSlice";

export default function LandingPage() {
  const dispatch = useDispatch();
  const { profile, isFetching, isError, isLoggedIn } =
    useSelector(userSelector);
  const history = useHistory();
  const onLogout = () => {
    dispatch(logoutUser({}));
  };

  useEffect(() => {
    if (!profile.id) {
      if (!isLoggedIn) {
        history.push("/login");
      }

      dispatch(fetchUserProfile({}));
    }
  }, [profile.id, isLoggedIn, history]);

  return (
    <div>
      <>
        <h3>
          <strong>Welcome to Landing Page</strong>
        </h3>
        {isLoggedIn ? <button onClick={onLogout}>Sign out</button> : null}
      </>
    </div>
  );
}
