import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { TextInput, Button, Text, Surface, Title, HelperText } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { StatusBar } from 'expo-status-bar';
import { authService } from '../services/authService';

// Validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const LoginScreen = ({ navigation }) => {
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Farm theme background image
  const farmBackgroundImage = {
    uri: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8ZmFybSUyMGxhbmRzY2FwZXxlbnwwfHwwfHw%3D&w=1000&q=80',
  };

  const handleLogin = async (values) => {
    try {
      setLoading(true);
      setError('');
      // Debug: Log input parameters (mask password for security)
      console.log('Login Attempt at:', new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }));
      console.log('Input Parameters:', {
        email: values.email,
        password: '****', // Masked for security
      });

      // Call the login API
      const response = await authService.login(values.email, values.password);

      // Debug: Log API response
      console.log('Login API Response:', {
        status: response.status || 'N/A',
        data: response.data,
      });

      // Navigate to Home screen on successful login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      // Debug: Log detailed error
      console.error('Login Error:', {
        message: error.message,
        response: error.response
            ? {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
            }
            : 'No response from server - check network or server status',
      });

      // Customize error message for user
      let errorMessage = 'Failed to login. Please try again.';
      if (error.message.includes('Network Error')) {
        errorMessage = 'Unable to connect to the server. Check your internet or try again later.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
      <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
      >
        <StatusBar style="auto" />
        <Image source={farmBackgroundImage} style={styles.backgroundImage} />

        {/* Full-screen loading overlay */}
        {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#2e7d32" />
              <Text style={styles.loadingText}>Logging in...</Text>
            </View>
        )}

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Surface style={styles.surface}>
            <View style={styles.logoContainer}>
              <Image
                  source={require('../../assets/icon.png')}
                  style={styles.logo}
              />
              {/*<Title style={styles.appTitle}>Farmer Login</Title>*/}
            </View>

            <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={LoginSchema}
                onSubmit={handleLogin}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                  <View style={styles.formContainer}>
                    <TextInput
                        label="Email"
                        value={values.email}
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                        error={touched.email && errors.email}
                        style={styles.input}
                        mode="outlined"
                        left={<TextInput.Icon icon="email" />}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!loading} // Disable input during loading
                    />
                    {touched.email && errors.email && (
                        <HelperText type="error">{errors.email}</HelperText>
                    )}

                    <TextInput
                        label="Password"
                        value={values.password}
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                        error={touched.password && errors.password}
                        secureTextEntry={secureTextEntry}
                        style={styles.input}
                        mode="outlined"
                        left={<TextInput.Icon icon="lock" />}
                        right={
                          <TextInput.Icon
                              icon={secureTextEntry ? 'eye' : 'eye-off'}
                              onPress={() => setSecureTextEntry(!secureTextEntry)}
                          />
                        }
                        editable={!loading} // Disable input during loading
                    />
                    {touched.password && errors.password && (
                        <HelperText type="error">{errors.password}</HelperText>
                    )}

                    {error ? (
                        <View style={styles.errorContainer}>
                          <HelperText type="error">{error}</HelperText>
                          {error.includes('Unable to connect') && (
                              <TouchableOpacity onPress={() => handleSubmit()}>
                                <Text style={styles.retryText}>Retry</Text>
                              </TouchableOpacity>
                          )}
                        </View>
                    ) : null}

                    <Button
                        mode="contained"
                        onPress={() => handleSubmit()}
                        style={styles.button}
                        loading={loading}
                        disabled={loading}
                        contentStyle={styles.buttonContent}
                    >
                      Login
                    </Button>

                    <View style={styles.registerContainer}>
                      <Text>Don't have an account? </Text>
                      <TouchableOpacity
                          onPress={() => navigation.navigate('Register')}
                          disabled={loading} // Disable navigation during loading
                      >
                        <Text style={styles.registerText}>Register</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
              )}
            </Formik>
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e9', // Light green background
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2e7d32',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  surface: {
    padding: 20,
    borderRadius: 10,
    elevation: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: '#81c784',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#2e7d32',
  },
  appTitle: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  retryText: {
    color: '#2e7d32',
    fontWeight: 'bold',
    fontSize: 14,
  },
  button: {
    marginTop: 20,
    paddingVertical: 6,
    backgroundColor: '#2e7d32',
  },
  buttonContent: {
    height: 48, // Ensure consistent button height
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
});

export default LoginScreen;