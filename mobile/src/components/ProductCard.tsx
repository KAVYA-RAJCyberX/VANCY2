import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Heart } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import { Product } from '../services/product.service';
import { Link } from 'expo-router';
import { useWishlistStore } from '../store/useWishlistStore';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isInWishlist, addItem, removeItem } = useWishlistStore();
  const isWished = isInWishlist(product._id);

  const toggleWishlist = () => {
    if (isWished) {
      removeItem(product._id);
    } else {
      addItem(product);
    }
  };

  return (
    <Link href={`/product/${product.slug}`} asChild>
      <Pressable style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.images?.[0] || 'https://via.placeholder.com/300' }}
            style={styles.image}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
          {product.isSale && (
            <View style={styles.badgeSale}>
              <Text style={styles.badgeText}>SALE</Text>
            </View>
          )}
          {product.isNewArrival && !product.isSale && (
            <View style={styles.badgeNew}>
              <Text style={styles.badgeText}>NEW</Text>
            </View>
          )}
          <Pressable style={styles.wishlistBtn} onPress={toggleWishlist}>
            <Heart size={16} color={isWished ? Colors.secondary : Colors.primary} fill={isWished ? Colors.secondary : 'transparent'} />
          </Pressable>
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{product.price}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
            )}
          </View>
        </View>
      </Pressable>
    </Link>
  );
};

// Flexible 3-column sizing
const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 4,
    backgroundColor: Colors.background,
    maxWidth: '33.33%', // Ensure it doesn't expand beyond 1/3 if there's only 1 or 2 items in the last row
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: Colors.surface,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeSale: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: Colors.sale,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  badgeNew: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    padding: 4,
  },
  info: {
    paddingVertical: 8,
  },
  name: {
    fontSize: 11,
    color: Colors.text,
    fontWeight: '500',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  price: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.text,
  },
  originalPrice: {
    fontSize: 10,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
});

export default ProductCard;
