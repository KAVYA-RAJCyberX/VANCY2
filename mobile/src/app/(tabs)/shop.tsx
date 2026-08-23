import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text } from 'react-native';
import { Colors } from '../../constants/Colors';
import { getProducts, Product } from '../../services/product.service';
import ProductCard from '../../components/ProductCard';
import ProductSkeleton from '../../components/ProductSkeleton';
import { useFocusEffect } from 'expo-router';

export default function ShopScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchProducts = async (pageNumber = 1, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const data = await getProducts({ page: pageNumber, limit: 12 });
      
      if (data.products?.length === 0 || !data.products) {
        setHasMore(false);
      } else {
        if (isLoadMore) {
          setProducts(prev => [...prev, ...data.products]);
        } else {
          setProducts(data.products);
        }
        setHasMore(data.page < data.pages);
      }
    } catch (error) {
      console.error('Error fetching shop products', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, []);

  const handleLoadMore = () => {
    if (hasMore && !loadingMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, true);
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return <View style={styles.footerSpacing} />;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.secondary} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SHOP</Text>
      </View>
      <FlatList
        data={loading ? Array(12).fill({}) : products}
        keyExtractor={(item, index) => loading ? `skeleton-${index}` : `${item._id}-${index}`}
        numColumns={3}
        renderItem={({ item, index }) => 
          loading ? <ProductSkeleton key={`skel-${index}`} /> : <ProductCard product={item} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
      />
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
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerSpacing: {
    height: 40,
  }
});
