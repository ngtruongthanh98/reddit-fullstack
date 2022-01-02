import { FormControl, Button, Box } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';

import { RegisterInput, useRegisterMutation } from '../generated/graphql';

const Register = () => {
  const initialValues = { username: '', email: '', password: '' };

  const [registerUser, { data, loading: _regiterUserLoading, error }] =
    useRegisterMutation();

  const onRegisterSubmit = async (values: RegisterInput) => {
    const response = await registerUser({
      variables: {
        registerInput: values,
      },
    });

    console.log('RESPONSE', response);
  };

  return (
    <Wrapper>
      {error && <p>Failed to register: {error.message}</p>}
      {data && data.register?.success && (
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
