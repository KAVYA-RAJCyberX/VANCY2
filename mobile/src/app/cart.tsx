import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ScrollView } from 'react-native';
import { Colors } from '../constants/Colors';
import { useCartStore } from '../store/useCartStore';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Minus, Plus, Trash2, ChevronLeft } from 'lucide-react-native';

export default function CartScreen() {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const router = useRouter();

  const total = getTotalPrice();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft color={Colors.text} size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>SHOPPING BAG</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Your bag is empty.</Text>
          <Pressable style={styles.shopBtn} onPress={() => router.push('/(tabs)/shop')}>
            <Text style={styles.shopBtnText}>CONTINUE SHOPPING</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {items.map((item) => (
              <View key={item.cartItemId} style={styles.cartItem}>
                <Image source={{ uri: item.images[0] }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                    <Pressable onPress={() => removeItem(item.cartItemId)} hitSlop={10}>
                      <Trash2 size={18} color={Colors.textSecondary} />
                    </Pressable>
                  </View>
                  <Text style={styles.itemVariant}>Size: {item.selectedSize} | Color: {item.selectedColor}</Text>
                  <Text style={styles.itemPrice}>₹{item.price}</Text>

                  <View style={styles.quantityControl}>
                    <Pressable 
                      style={styles.qtyBtn} 
                      onPress={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}
                    >
                      <Minus size={14} color={Colors.text} />
                    </Pressable>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <Pressable 
                      style={styles.qtyBtn} 
                      onPress={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                    >
                      <Plus size={14} color={Colors.text} />
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{total}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>Calculated at checkout</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{total}</Text>
            </View>

            <Pressable style={styles.checkoutBtn} onPress={() => router.push('/(checkout)')}>
              <Text style={styles.checkoutBtnText}>CHECKOUT SECURELY</Text>
            </Pressable>
          </View>
        </>
      )}
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
  listContent: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 24,
  },
  itemImage: {
    width: 100,
    height: 133,
    backgroundColor: Colors.surface,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 16,
  },
  itemVariant: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    alignSelf: 'flex-start',
    borderRadius: 4,
  },
  qtyBtn: {
    padding: 8,
    paddingHorizontal: 12,
  },
  qtyText: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    color: Colors.text,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: Colors.text,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  checkoutBtn: {
    backgroundColor: Colors.primary,
    padding: 16,
    alignItems: 'center',
    borderRadius: 4,
    marginTop: 24,
  },
  checkoutBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  shopBtn: {
    backgroundColor: Colors.primary,
    padding: 16,
    paddingHorizontal: 32,
    borderRadius: 4,
  },
  shopBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  }
});
