import { Credentials, trySignIn } from './authHandler';
import { Link, useHistory } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { clearAlert, sendAlert } from '../common/alertSlice';
import { useDispatch, useSelector } from 'react-redux';

import Alert from '../common/Alert';
import { RootState } from '../store';
import { clearError } from './authSlice';
import { useForm } from 'react-hook-form';

const LoginPage: React.FC = () => {
  const { register, handleSubmit, errors } = useForm();
  const [showAlert, setShowAlert] = useState(false);

  const alertState = useSelector((state: RootState) => state.alert);
  const authState = useSelector((state: RootState) => state.auth);

  const dispatch = useDispatch();
  const history = useHistory();

  const onSubmit = (data: Credentials) => dispatch(trySignIn(data));

  const showFailAlert = () => {
    setShowAlert(true);
    setTimeout(() => hideAlert(), 5000);
  };

  const hideAlert = () => {
    setShowAlert(false);
    dispatch(clearAlert());
  };

  useEffect(() => {
    if (authState.signedIn) {
      history.push('/photos');
    }

    if (authState.error) {
      dispatch(
        sendAlert({
          type: 'negative',
          title: 'Error!',
          message: 'Your credentials do not match. Please try again.',
        }),
      );
      dispatch(clearError());
    }
  });

  useEffect(() => {
    if (alertState.showAlert) {
      showFailAlert();
    } else {
      hideAlert();
    }
  }, [alertState]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Alert
        visible={showAlert}
        positive={alertState.alertType === 'positive'}
        header={alertState.alertTitle}
        body={alertState.alertMessage}
        onClose={hideAlert}
        clickable={alertState.onAlertClick != null}
        onClick={alertState.onAlertClick}
      />
      <div className="max-w-md w-full space-y-3">
        <h1 className="font-default text-5xl font-bold mt-6 text-center">sign in</h1>
        <p className="font-default text-center text-md text-gray-600">
          or&nbsp;
          <Link to="/signup" className="font-medium text-emerald-600 hover:text-emerald-400">
            sign up
          </Link>
        </p>
        <div className="rounded-md shadow-md border space-y-6 bg-white px-9 py-6">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="font-default font-normal text-md">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                className="font-default appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                ref={register({
                  required: true,
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'invalid email address',
                  },
                })}
              />
              {errors.email && errors.email.type === 'required' && (
                <p className="mt-1 text-red-600 font-default">email is required</p>
              )}
              {errors.email && errors.email.type === 'pattern' && (
                <p className="mt-1 text-red-600 font-default">email is invalid</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="font-default text-md">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="font-default appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                ref={register({ required: true, minLength: 8 })}
              />
              {errors.password && errors.password.type === 'required' && (
                <p className="mt-1 text-red-600 font-default">password is required</p>
              )}
              {errors.password && errors.password.type === 'minLength' && (
                <p className="mt-1 text-red-600 font-default">password must be at least 8 characters</p>
              )}
            </div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent font-default text-sm font-medium rounded-md text-black bg-emerald-400 active:bg-emerald-500 focus:outline-none hover:shadow-md"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
