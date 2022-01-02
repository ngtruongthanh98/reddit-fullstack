import { FormControl, Button, Box } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';

import { registerMutation } from '../graphql-client/mutations';
import { useMutation } from '@apollo/client';

const Register = () => {
  const initialValues: NewUserInput = { username: '', email: '', password: '' };

  interface UserMutationResponse {
    code: number;
    success: boolean;
    message: string;
    user: string;
    errros: string;
  }

  interface NewUserInput {
    username: string;
    email: string;
    password: string;
  }

  const [registerUser, { data, error }] = useMutation<
    { register: UserMutationResponse },
    { registerInput: NewUserInput }
  >(registerMutation);

  const onRegisterSubmit = (values: NewUserInput) => {
    registerUser({
      variables: {
        registerInput: values,
      },
    });
  };

  return (
    <Wrapper>
      {error && <p>Failed to register</p>}
      {data && data.register.success && (
        <p>Successfully registered {JSON.stringify(data)}</p>
      )}
      <Formik initialValues={initialValues} onSubmit={onRegisterSubmit}>
        {({ isSubmitting }) => (
          <Form>
            <FormControl>
              <InputField
                name="username"
                type="text"
                placeholder="Username"
                label="Username"
              />

              <Box mt={4}>
                <InputField
                  name="email"
                  type="text"
                  placeholder="Email"
                  label="Email"
                />
              </Box>

              <Box mt={4}>
                <InputField
                  name="password"
                  type="password"
                  placeholder="Password"
                  label="Password"
                />
              </Box>

              <Button
                type="submit"
                colorScheme="teal"
                mt={4}
                isLoading={isSubmitting}
              >
                Register
              </Button>
            </FormControl>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
