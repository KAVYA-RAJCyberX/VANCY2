import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, StyleSheet, FlatList, ActivityIndicator, Text } from 'react-native';
import { Colors } from '../../constants/Colors';
import { getProducts, Product } from '../../services/product.service';
import ProductCard from '../../components/ProductCard';
import ProductSkeleton from '../../components/ProductSkeleton';
import { Search as SearchIcon } from 'lucide-react-native';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Simple debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      fetchSearchResults();
    } else {
      setProducts([]);
    }
  }, [debouncedQuery]);

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      const data = await getProducts({ keyword: debouncedQuery, limit: 20 });
      setProducts(data.products || []);
    } catch (error) {
      console.error('Search error', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <SearchIcon size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Search VANCY..."
            placeholderTextColor={Colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        </View>
      </View>
      
      {loading ? (
        <FlatList
          data={Array(12).fill({})}
          keyExtractor={(_, i) => `skel-${i}`}
          numColumns={3}
          renderItem={() => <ProductSkeleton />}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
        />
      ) : products.length > 0 ? (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          numColumns={3}
          renderItem={({ item }) => <ProductCard product={item} />}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
        />
      ) : debouncedQuery ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No results found for "{debouncedQuery}"</Text>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Start typing to explore our collection.</Text>
        </View>
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
    backgroundColor: Colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
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
    padding: 24,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
