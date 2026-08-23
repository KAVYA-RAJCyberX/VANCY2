import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../constants/Colors';

const ProductSkeleton = () => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.imageSkeleton, { opacity: fadeAnim }]} />
      <View style={styles.info}>
        <Animated.View style={[styles.textSkeleton, styles.nameSkeleton, { opacity: fadeAnim }]} />
        <Animated.View style={[styles.textSkeleton, styles.priceSkeleton, { opacity: fadeAnim }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 4,
    maxWidth: '33.33%',
  },
  imageSkeleton: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: '#EAEAEA',
  },
  info: {
    paddingVertical: 8,
  },
  textSkeleton: {
    backgroundColor: '#EAEAEA',
    height: 10,
    borderRadius: 2,
    marginBottom: 6,
  },
  nameSkeleton: {
    width: '80%',
  },
  priceSkeleton: {
    width: '40%',
  },
});

export default ProductSkeleton;
