import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { COLORS } from '../../../constants/colors';
import { PRODUCT_ICONS } from '../../../data/productIcons';

const ProductShapePicker = ({ selectedIcon, onSelectIcon }) => {
    return (
        <View style={styles.fieldGroup}>
            <Text style={styles.label}>Product Shape</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.shelfScrollContent}
            >
                {PRODUCT_ICONS.map((item) => {
                    const isSelected = selectedIcon === item.id;
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.iconCard,
                                isSelected && styles.iconCardSelected
                            ]}
                            onPress={() => onSelectIcon(item.id)}
                            activeOpacity={0.8}
                        >
                            <Image
                                source={item.image}
                                style={styles.iconImage}
                                resizeMode="contain"
                            />
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Shelf Line */}
            <View style={styles.shelfLine} />
        </View>
    );
};

export default ProductShapePicker;

const styles = StyleSheet.create({
    fieldGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textMain,
        marginBottom: 10,
    },
    shelfScrollContent: {
        alignItems: 'flex-end',
        paddingHorizontal: 4,
        gap: 12,
        paddingBottom: 4,
    },
    iconCard: {
        width: 58,
        height: 58,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    iconCardSelected: {
        borderColor: COLORS.primary,
    },
    iconImage: {
        width: 36,
        height: 36,
    },
    shelfLine: {
        height: 1,
        backgroundColor: COLORS.border,
        width: '100%',
        marginTop: 2,
        marginBottom: 8,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4,
    },
});
