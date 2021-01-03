import { Link, useHistory } from 'react-router-dom';
import React, { useState } from 'react';
import { SignUpData, addNewUser } from '../common/userHandler';

import Alert from '../common/Alert';
import { useForm } from 'react-hook-form';

const SignUpPage: React.FC = () => {
  const { register, handleSubmit, errors } = useForm();
  const [successVisible, setSuccessVisible] = useState(false);
  const [failureVisible, setFailureVisible] = useState(false);
  const history = useHistory();

  const onSubmit = async (data: SignUpData) => {
    const res = await addNewUser(data);
    if (res) {
      showSuccessAlert();
    } else {
      showFailAlert();
    }
  };

  const showSuccessAlert = () => {
    setSuccessVisible(true);
    setTimeout(() => setSuccessVisible(false), 5000);
  };

  const showFailAlert = () => {
    setFailureVisible(true);
    setTimeout(() => setFailureVisible(false), 5000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Alert
        visible={successVisible}
        positive
        header="Account created!"
        body="Please sign in to continue"
        onClose={() => setSuccessVisible(false)}
        clickable
        onClick={() => history.push('/login')}
      />
      <Alert
        visible={failureVisible}
        positive={false}
        header="Error!"
        body="There was a problem creating your account. Please try again."
        onClose={() => setFailureVisible(false)}
        clickable={false}
      />
      <div className="max-w-md w-full space-y-3">
        <h1 className="font-default text-5xl font-bold mt-6 text-center">sign up</h1>
        <p className="font-default text-center text-md text-gray-600">
          or&nbsp;
          <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-400">
            sign in
          </Link>
        </p>
        <div className="rounded-md shadow-md space-y-6 bg-white px-9 py-6">
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
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-emerald-400 active:bg-emerald-500 focus:outline-none hover:shadow-md"
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
