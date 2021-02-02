import { Link, useHistory } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { SignUpData, addNewUser } from '../users/userHandler';
import { clearAlert, sendAlert } from '../common/alertSlice';
import { useDispatch, useSelector } from 'react-redux';

import Alert from '../common/Alert';
import { RootState } from '../store';
import { useForm } from 'react-hook-form';

const SignUpPage: React.FC = () => {
  const alertState = useSelector((state: RootState) => state.alert);
  const [showAlert, setShowAlert] = useState(false);

  const { register, handleSubmit, errors } = useForm();

  const dispatch = useDispatch();
  const history = useHistory();

  const onSubmit = async (data: SignUpData) => {
    if (process.env.REACT_APP_DISABLE_SIGN_UP !== 'false') {
      dispatch(
        sendAlert({
          type: 'negative',
          title: 'Feature disabled!',
          message: 'Creating new accounts is currently disabled. Please use an existing test account.',
        }),
      );
      return;
    }

    const res = await addNewUser(data);
    if (res) {
      dispatch(
        sendAlert({
          type: 'positive',
          title: 'Account created!',
          message: 'Please sign in to continue.',
          onClick: () => history.push('/login'),
        }),
      );
    } else {
      dispatch(
        sendAlert({
          type: 'negative',
          title: 'Error!',
          message: 'There was a problem creating your account. Please try again.',
        }),
      );
    }
  };

  const showAlertWithTimeout = () => {
    setShowAlert(true);
    setTimeout(() => hideAlert(), 5000);
  };

  const hideAlert = () => {
    setShowAlert(false);
    dispatch(clearAlert());
  };

  useEffect(() => {
    if (alertState.showAlert) {
      showAlertWithTimeout();
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
        <h1 className="font-default text-5xl font-bold mt-6 text-center">sign up</h1>
        <p className="font-default text-center text-md text-gray-600">
          or&nbsp;
          <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-400">
            sign in
          </Link>
        </p>
        <div className="rounded-md shadow-md border space-y-6 bg-white px-9 py-6">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="name" className="font-default text-md">
                Name
              </label>
              <input
                id="name"
                name="name"
                className="font-default appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                ref={register({ required: true })}
              />
              {errors.name && errors.name.type === 'required' && (
                <p className="mt-1 text-red-600 font-default">name is required</p>
              )}
            </div>
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
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-default font-medium rounded-md text-black bg-emerald-400 active:bg-emerald-500 focus:outline-none hover:shadow-md"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
