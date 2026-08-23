import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { getProductBySlug, Product } from '../../services/product.service';
import { Colors } from '../../constants/Colors';
import { ChevronLeft, Heart, ShoppingBag } from 'lucide-react-native';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useCartStore } from '../../store/useCartStore';

const { width } = Dimensions.get('window');

export default function ProductDetailsScreen() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const { isInWishlist, addItem: addWishlist, removeItem: removeWishlist } = useWishlistStore();
  const { addItem: addCart } = useCartStore();

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const data = await getProductBySlug(slug as string);
      setProduct(data);
      if (data?.variants?.length > 0) {
        setSelectedSize(data.variants[0].size);
        setSelectedColor(data.variants[0].color);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.secondary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Product not found.</Text>
      </View>
    );
  }

  const isWished = isInWishlist(product._id);
  const toggleWishlist = () => {
    isWished ? removeWishlist(product._id) : addWishlist(product);
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert("Please select a size and color");
      return;
    }
    addCart({
      ...product,
      cartItemId: `${product._id}-${selectedSize}-${selectedColor}`,
      quantity: 1,
      selectedSize,
      selectedColor
    });
    alert("Added to cart");
  };

  // Derive unique sizes and colors from variants
  const sizes = Array.from(new Set(product.variants?.map(v => v.size) || []));
  const colors = Array.from(new Set(product.variants?.filter(v => v.size === selectedSize).map(v => v.color) || []));

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ChevronLeft color={Colors.text} size={24} />
          </Pressable>
          <Pressable style={styles.wishlistBtn} onPress={toggleWishlist}>
            <Heart color={isWished ? Colors.secondary : Colors.text} fill={isWished ? Colors.secondary : 'transparent'} size={24} />
          </Pressable>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {product.images?.map((img, idx) => (
              <Image key={idx} source={{ uri: img }} style={styles.image} contentFit="cover" />
            ))}
          </ScrollView>
        </View>

        <View style={styles.details}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{product.price}</Text>
            {product.originalPrice && <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>}
          </View>

          {sizes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Size</Text>
              <View style={styles.chipsRow}>
                {sizes.map(size => (
                  <Pressable 
                    key={size} 
                    style={[styles.chip, selectedSize === size && styles.chipActive]}
                    onPress={() => setSelectedSize(size as string)}
                  >
                    <Text style={[styles.chipText, selectedSize === size && styles.chipTextActive]}>{size as string}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {colors.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Color</Text>
              <View style={styles.chipsRow}>
                {colors.map(color => (
                  <Pressable 
                    key={color} 
                    style={[styles.chip, selectedColor === color && styles.chipActive]}
                    onPress={() => setSelectedColor(color as string)}
                  >
                    <Text style={[styles.chipText, selectedColor === color && styles.chipTextActive]}>{color as string}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable style={styles.addToCartBtn} onPress={handleAddToCart}>
          <ShoppingBag color="#FFF" size={20} />
          <Text style={styles.addToCartText}>ADD TO CART</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: width,
    height: width * 1.3,
    position: 'relative',
    backgroundColor: Colors.surface,
  },
  image: {
    width: width,
    height: width * 1.3,
  },
  backBtn: {
    position: 'absolute',
    top: 48,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    padding: 8,
  },
  wishlistBtn: {
    position: 'absolute',
    top: 48,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    padding: 8,
  },
  details: {
    padding: 16,
    paddingBottom: 100, // Space for bottom bar
  },
  category: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  originalPrice: {
    fontSize: 16,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 4,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.text,
    fontSize: 14,
  },
  chipTextActive: {
    color: '#FFF',
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  addToCartBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 4,
    gap: 8,
  },
  addToCartText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
