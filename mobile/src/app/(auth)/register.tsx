import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/Colors';
import { register } from '../../services/auth.service';
import { useAuthStore } from '../../store/useAuthStore';
import { useRouter, Link } from 'expo-router';
import { X } from 'lucide-react-native';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login: setLogin } = useAuthStore();
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const user = await register(name, email, password);
      setLogin(user);
      // Assuming register returns user object. If not, we might need to login right after.
      router.back();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CREATE ACCOUNT</Text>
        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
          <X color={Colors.text} size={24} />
        </Pressable>
      </View>
      
      <View style={styles.form}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor={Colors.textSecondary}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor={Colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={Colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <Pressable style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>REGISTER</Text>
          )}
        </Pressable>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text style={styles.linkText}>Sign In</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    position: 'relative',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: Colors.text,
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    top: 48,
  },
  form: {
    padding: 24,
  },
  errorText: {
    color: Colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 4,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: Colors.text,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    alignItems: 'center',
    borderRadius: 4,
    marginTop: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  linkText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
