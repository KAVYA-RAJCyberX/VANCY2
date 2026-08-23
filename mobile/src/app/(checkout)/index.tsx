import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import api from '../../services/api';
import * as WebBrowser from 'expo-web-browser';

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const total = getTotalPrice();

  const [loading, setLoading] = useState(false);
  const [shippingDetails, setShippingDetails] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
  });

  const handleCheckout = async () => {
    if (!user) {
      alert("Please login to complete your purchase.");
      router.push('/(auth)/login');
      return;
    }

    try {
      setLoading(true);
      // Construct payload similar to backend requirements
      const orderItems = items.map(item => ({
        product: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.selectedSize,
        color: item.selectedColor,
        image: item.images[0],
      }));

      const payload = {
        orderItems,
        shippingAddress: {
          address: shippingDetails.address,
          city: shippingDetails.city,
          postalCode: shippingDetails.pincode,
          country: 'India',
          state: shippingDetails.state,
          phone: shippingDetails.phone,
          firstName: shippingDetails.firstName,
          lastName: shippingDetails.lastName,
        },
        itemsPrice: total,
        taxPrice: 0,
        shippingPrice: total > 5000 ? 0 : 100, // Dummy logic
        totalPrice: total > 5000 ? total : total + 100,
      };

      // 1. Create order
      const { data: order } = await api.post('/orders', payload);

      // 2. Initiate Razorpay order creation (simulate flow)
      // Since this is Expo Go, we'd normally open a WebView or use the backend to generate the link
      // For now, we will just simulate a successful order to complete the UI flow.
      alert('Order placed successfully! Redirecting...');
      clearCart();
      router.replace('/(tabs)/account');
      
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || 'Error processing checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft color={Colors.text} size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>CHECKOUT</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SHIPPING ADDRESS</Text>
          
          <View style={styles.row}>
            <TextInput 
              style={[styles.input, { flex: 1, marginRight: 8 }]} 
              placeholder="First Name" 
              value={shippingDetails.firstName}
              onChangeText={(val) => setShippingDetails(prev => ({...prev, firstName: val}))}
            />
            <TextInput 
              style={[styles.input, { flex: 1, marginLeft: 8 }]} 
              placeholder="Last Name" 
              value={shippingDetails.lastName}
              onChangeText={(val) => setShippingDetails(prev => ({...prev, lastName: val}))}
            />
          </View>
          
          <TextInput 
            style={styles.input} 
            placeholder="Address" 
            value={shippingDetails.address}
            onChangeText={(val) => setShippingDetails(prev => ({...prev, address: val}))}
          />
          
          <View style={styles.row}>
            <TextInput 
              style={[styles.input, { flex: 1, marginRight: 8 }]} 
              placeholder="City" 
              value={shippingDetails.city}
              onChangeText={(val) => setShippingDetails(prev => ({...prev, city: val}))}
            />
            <TextInput 
              style={[styles.input, { flex: 1, marginLeft: 8 }]} 
              placeholder="State" 
              value={shippingDetails.state}
              onChangeText={(val) => setShippingDetails(prev => ({...prev, state: val}))}
            />
          </View>

          <View style={styles.row}>
            <TextInput 
              style={[styles.input, { flex: 1, marginRight: 8 }]} 
              placeholder="PIN Code" 
              keyboardType="number-pad"
              value={shippingDetails.pincode}
              onChangeText={(val) => setShippingDetails(prev => ({...prev, pincode: val}))}
            />
            <TextInput 
              style={[styles.input, { flex: 1, marginLeft: 8 }]} 
              placeholder="Phone" 
              keyboardType="phone-pad"
              value={shippingDetails.phone}
              onChangeText={(val) => setShippingDetails(prev => ({...prev, phone: val}))}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ORDER SUMMARY</Text>
          {items.map(item => (
            <View key={item.cartItemId} style={styles.summaryItem}>
              <Text style={styles.summaryItemText} numberOfLines={1}>{item.quantity}x {item.name}</Text>
              <Text style={styles.summaryItemPrice}>₹{item.price * item.quantity}</Text>
            </View>
          ))}
          <View style={[styles.summaryItem, { marginTop: 16, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 16 }]}>
            <Text style={{ fontWeight: 'bold' }}>Total</Text>
            <Text style={{ fontWeight: 'bold' }}>₹{total}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.payBtn} onPress={handleCheckout} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.payBtnText}>PROCEED TO PAYMENT</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    top: 48,
    zIndex: 10,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: Colors.text,
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 16,
    borderRadius: 4,
    fontSize: 14,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryItemText: {
    flex: 1,
    color: Colors.text,
    marginRight: 16,
  },
  summaryItemPrice: {
    color: Colors.text,
    fontWeight: '500',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  payBtn: {
    backgroundColor: Colors.primary,
    padding: 16,
    alignItems: 'center',
    borderRadius: 4,
  },
  payBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
