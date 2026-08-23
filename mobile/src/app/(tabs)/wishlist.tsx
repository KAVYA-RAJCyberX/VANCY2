import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useWishlistStore } from '../../store/useWishlistStore';
import ProductCard from '../../components/ProductCard';

export default function WishlistScreen() {
  const { items } = useWishlistStore();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WISHLIST</Text>
      </View>
      
      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Your wishlist is empty.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          numColumns={3}
          renderItem={({ item }) => <ProductCard product={item} />}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
        />
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
  listContent: {
    paddingBottom: 20,
    paddingTop: 8,
  },
  columnWrapper: {
    paddingHorizontal: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
