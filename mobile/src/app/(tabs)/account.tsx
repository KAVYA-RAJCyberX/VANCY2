import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuthStore } from '../../store/useAuthStore';
import { useRouter } from 'expo-router';

export default function AccountScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ACCOUNT</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.welcomeText}>Sign in to manage your account and orders.</Text>
          <Pressable style={styles.button} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.buttonText}>LOGIN</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.buttonSecondary]} onPress={() => router.push('/(auth)/register')}>
            <Text style={[styles.buttonText, { color: Colors.text }]}>CREATE ACCOUNT</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MY ACCOUNT</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>Welcome, {user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>

        <View style={styles.menuList}>
          <Pressable style={styles.menuItem}>
            <Text style={styles.menuText}>My Orders</Text>
          </Pressable>
          <Pressable style={styles.menuItem}>
            <Text style={styles.menuText}>Addresses</Text>
          </Pressable>
          <Pressable style={styles.menuItem} onPress={() => {
            logout();
          }}>
            <Text style={[styles.menuText, { color: Colors.error }]}>Log Out</Text>
          </Pressable>
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
    padding: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: Colors.text,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.primary,
    width: '100%',
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonSecondary: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  menuList: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuText: {
    fontSize: 16,
    color: Colors.text,
  },
});
