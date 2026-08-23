import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, Dimensions } from 'react-native';
import { Colors } from '../../constants/Colors';
import { getProducts, Product } from '../../services/product.service';
import ProductCard from '../../components/ProductCard';
import ProductSkeleton from '../../components/ProductSkeleton';
import { Link } from 'expo-router';

export default function HomeScreen() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch specifically new arrivals
      const data = await getProducts({ isNewArrival: true, limit: 6 });
      setNewArrivals(data.products || []);
    } catch (error) {
      console.error('Error fetching home products', error);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>VANCY</Text>
        <Text style={styles.heroSubtitle}>NEW COLLECTION 2026</Text>
      </View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>NEW ARRIVALS</Text>
        <Link href="/shop" asChild>
          <Pressable>
            <Text style={styles.seeAll}>View All</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={loading ? Array(6).fill({}) : newArrivals}
        keyExtractor={(item, index) => loading ? `skeleton-${index}` : item._id}
        numColumns={3}
        renderItem={({ item, index }) => 
          loading ? <ProductSkeleton key={`skel-${index}`} /> : <ProductCard product={item} />
        }
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingBottom: 20,
  },
  columnWrapper: {
    paddingHorizontal: 4,
  },
  header: {
    marginBottom: 16,
  },
  hero: {
    height: 300,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  heroTitle: {
    color: Colors.secondary,
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  heroSubtitle: {
    color: '#FFF',
    fontSize: 14,
    letterSpacing: 2,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    letterSpacing: 1,
  },
  seeAll: {
    fontSize: 12,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
