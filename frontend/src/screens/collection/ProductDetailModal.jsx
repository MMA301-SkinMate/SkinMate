/**
 * ProductDetailModal.jsx
 *
 * Popup showing full product info + inline edit form for:
 *   openedDate, expirationDate, note
 * Also exposes long-press actions (Edit → delete/used-up) via parent.
 */

import { useState, useCallback } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { X, Calendar, StickyNote, AlertTriangle, CheckCircle, Edit3 } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import { PRODUCT_TYPES, getProductIcon } from '../../constants/product-icons';
import { useCollection } from '../../context/CollectionContext';
import { parseToISODate } from '../../utils/formatDate';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(value) {
    if (!value) return '—';
    return new Intl.DateTimeFormat('vi-VN').format(new Date(value));
}

function daysLeftLabel(product) {
    if (!product.expirationDate) return null;
    const days = Math.ceil((new Date(product.expirationDate) - new Date()) / 86_400_000);
    if (days < 0) return { text: `Expired ${Math.abs(days)} days ago`, danger: true };
    if (days === 0) return { text: 'Expires today', danger: true };
    if (days <= 7)  return { text: `${days} days left`, danger: true };
    if (days <= 30) return { text: `${days} days left`, warn: true };
    return { text: `${days} days left`, ok: true };
}

const TYPE_LABELS = Object.fromEntries(
    PRODUCT_TYPES.map(t => [t.id, t.label])
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProductDetailModal({ product, onClose, onLongPress }) {
    const { updateProduct } = useCollection();
    const [editMode, setEditMode]             = useState(false);
    const [openedDate, setOpenedDate]         = useState(product.openedDate ? formatDate(product.openedDate) : '');
    const [expirationDate, setExpirationDate] = useState(product.expirationDate ? formatDate(product.expirationDate) : '');
    const [note, setNote]                     = useState(product.note || '');
    const [saving, setSaving]                 = useState(false);

    const icon      = getProductIcon(product.productIcon, product.productType);
    const expLabel  = daysLeftLabel(product);
    const isExpired = product.status === 'expired_warning';
    const isRedAlert = isExpired && product.continueAfterExpiry;

    const handleSave = useCallback(async () => {
        setSaving(true);
        try {
            const parsedOpened = openedDate.trim() ? parseToISODate(openedDate.trim()) : null;
            const parsedExpiry = expirationDate.trim() ? parseToISODate(expirationDate.trim()) : null;

            await updateProduct(product._id || product.id, {
                openedDate:     parsedOpened,
                expirationDate: parsedExpiry,
                note:           note.trim() || null,
            });

            setEditMode(false);
        } catch (err) {
            Alert.alert('Error', err?.message || 'Unable to save changes. Please try again.');
        } finally {
            setSaving(false);
        }
    }, [openedDate, expirationDate, note, product, updateProduct]);

    return (
        <Modal
            transparent
            animationType="slide"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={editMode ? undefined : onClose} />
                <View style={styles.sheet}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    >
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={styles.scrollContent}
                        >
                            {/* Header */}
                            <View style={styles.header}>
                                <View style={styles.productIconContainer}>
                                    <Image
                                        source={icon.image}
                                        style={styles.productIcon}
                                        resizeMode="contain"
                                    />
                                </View>
                                <View style={styles.headerInfo}>
                                    <Text style={styles.productName} numberOfLines={2}>
                                        {product.productName}
                                    </Text>
                                    <View style={styles.typePill}>
                                        <Text style={styles.typePillText}>
                                            {TYPE_LABELS[product.productType] || product.productType}
                                        </Text>
                                    </View>
                                    {isRedAlert && (
                                        <View style={styles.redBadge}>
                                            <AlertTriangle size={11} color="#fff" />
                                            <Text style={styles.redBadgeText}>Expired — still in use</Text>
                                        </View>
                                    )}
                                </View>
                                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                                    <X size={20} color={Colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            {/* Expiry status label */}
                            {expLabel && (
                                <View style={[
                                    styles.expiryBanner,
                                    expLabel.danger && styles.expiryBannerDanger,
                                    expLabel.warn   && styles.expiryBannerWarn,
                                    expLabel.ok     && styles.expiryBannerOk,
                                ]}>
                                    <AlertTriangle
                                        size={13}
                                        color={expLabel.danger ? Colors.error : expLabel.warn ? Colors.warning : Colors.success}
                                    />
                                    <Text style={[
                                        styles.expiryBannerText,
                                        expLabel.danger && { color: Colors.error },
                                        expLabel.warn   && { color: Colors.warning },
                                        expLabel.ok     && { color: Colors.success },
                                    ]}>
                                        {expLabel.text}
                                    </Text>
                                </View>
                            )}

                            {/* Ingredients list */}
                            {product.ingredients && product.ingredients.length > 0 && (
                                <View style={styles.section}>
                                        <Text style={styles.sectionLabel}>Ingredients ({product.ingredients.length})</Text>
                                    <View style={styles.ingredientWrap}>
                                        {product.ingredients.slice(0, 20).map((ing, idx) => (
                                            <View key={idx} style={styles.ingBadge}>
                                                <Text style={styles.ingText}>{ing}</Text>
                                            </View>
                                        ))}
                                        {product.ingredients.length > 20 && (
                                            <View style={styles.ingBadge}>
                                                <Text style={styles.ingText}>+{product.ingredients.length - 20} more</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            )}

                            {/* Date fields */}
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>
                                        <Calendar size={13} color={Colors.muted} /> Opened date
                                </Text>
                                {editMode ? (
                                    <TextInput
                                        style={styles.input}
                                        value={openedDate}
                                        onChangeText={setOpenedDate}
                                        placeholder="dd/mm/yyyy"
                                        placeholderTextColor={Colors.muted}
                                    />
                                ) : (
                                    <Text style={styles.fieldValue}>
                                        {product.openedDate ? formatDate(product.openedDate) : 'Not set'}
                                    </Text>
                                )}
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>
                                        <Calendar size={13} color={Colors.muted} /> Expiration date
                                </Text>
                                {editMode ? (
                                    <TextInput
                                        style={styles.input}
                                        value={expirationDate}
                                        onChangeText={setExpirationDate}
                                        placeholder="dd/mm/yyyy"
                                        placeholderTextColor={Colors.muted}
                                    />
                                ) : (
                                    <Text style={[styles.fieldValue, expLabel?.danger && { color: Colors.error }]}>
                                        {product.expirationDate ? formatDate(product.expirationDate) : 'Not set'}
                                    </Text>
                                )}
                            </View>

                            {/* Note */}
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>
                                        <StickyNote size={13} color={Colors.muted} /> Notes
                                </Text>
                                {editMode ? (
                                    <TextInput
                                        style={[styles.input, styles.inputMultiline]}
                                        value={note}
                                        onChangeText={setNote}
                                        placeholder="Add notes..."
                                        placeholderTextColor={Colors.muted}
                                        multiline
                                        numberOfLines={3}
                                    />
                                ) : (
                                    <Text style={styles.fieldValue}>
                                        {product.note || 'No notes'}
                                    </Text>
                                )}
                            </View>

                            {/* Analysis result summary */}
                            {product.analysisResult && <AnalysisDetails analysis={product.analysisResult} />}
                            {false && product.analysisResult?.verdict && (
                                <View style={styles.analysisBanner}>
                                    <Text style={styles.analysisScore}>
                                        Analysis score: {product.analysisResult.contextualScore ?? product.analysisResult.baseScore ?? '—'}%
                                    </Text>
                                    <Text style={styles.analysisVerdict} numberOfLines={3}>
                                        {product.analysisResult.verdict?.text}
                                    </Text>
                                </View>
                            )}

                            {/* Action buttons */}
                            <View style={styles.actions}>
                                {editMode ? (
                                    <>
                                        <TouchableOpacity
                                            style={styles.cancelBtn}
                                            onPress={() => setEditMode(false)}
                                            disabled={saving}
                                        >
                                            <Text style={styles.cancelBtnText}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.saveBtn}
                                            onPress={handleSave}
                                            disabled={saving}
                                        >
                                            {saving
                                                ? <ActivityIndicator color="#fff" size="small" />
                                                : <Text style={styles.saveBtnText}>Save</Text>
                                            }
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <TouchableOpacity
                                            style={styles.editBtn}
                                            onPress={() => setEditMode(true)}
                                        >
                                            <Edit3 size={16} color={Colors.primary} />
                                        <Text style={styles.editBtnText}>Edit</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionMoreBtn, styles.hiddenAction]}
                                            onPress={() => {
                                                onClose();
                                                onLongPress?.(product);
                                            }}
                                        >
            <Text style={styles.actionMoreText}>Delete / Used</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
            </View>
        </Modal>
    );
}

function AnalysisDetails({ analysis }) {
    const verdict = analysis.verdict || {};
    const conflict = analysis.conflictResolution || {};
    const pairing = analysis.pairingRecommendation || {};
    const future = analysis.futurePlan || {};
    const list = value => Array.isArray(value) ? value.filter(Boolean).join(', ') : value;

    return (
        <View style={styles.analysisDetails}>
            <Text style={styles.analysisHeading}>Product analysis</Text>
            <View style={styles.scoreRow}>
                <Text style={styles.analysisScore}>Base: {analysis.baseScore ?? '—'}%</Text>
                <Text style={styles.analysisScore}>Context: {analysis.contextualScore ?? '—'}%</Text>
            </View>
            {verdict.text && <AnalysisField label="Verdict" value={verdict.text} />}
            {conflict.details && <AnalysisField label={conflict.hasConflict ? 'Conflict' : 'Routine'} value={conflict.details} danger={conflict.hasConflict} />}
            {pairing.advice && <AnalysisField label="Pairing recommendation" value={pairing.advice} />}
            {pairing.matchedProductInCloset && <AnalysisField label="Best match in collection" value={pairing.matchedProductInCloset.productName || pairing.matchedProductInCloset} />}
            {list(pairing.ingredientsToAdd) && <AnalysisField label="Add" value={list(pairing.ingredientsToAdd)} />}
            {list(pairing.ingredientsToAvoid) && <AnalysisField label="Avoid" value={list(pairing.ingredientsToAvoid)} danger />}
            {(future.frequency || future.timing || future.notes) && (
                <AnalysisField label="Usage plan" value={[future.frequency, future.timing, future.notes].filter(Boolean).join(' • ')} />
            )}
        </View>
    );
}

function AnalysisField({ label, value, danger = false }) {
    return (
        <View style={styles.analysisField}>
            <Text style={[styles.analysisFieldLabel, danger && styles.analysisDanger]}>{label}</Text>
            <Text style={styles.analysisFieldValue}>{String(value)}</Text>
        </View>
    );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
    overlay:           { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    backdrop:          { ...StyleSheet.absoluteFillObject },
    sheet:             { backgroundColor: Colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '92%' },
    scrollContent:     { padding: 20, paddingBottom: 36, gap: 14 },

    header:            { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 4 },
    productIconContainer: { width: 64, height: 72, borderRadius: 14, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
    productIcon:       { width: 52, height: 60 },
    headerInfo:        { flex: 1, gap: 6 },
    productName:       { fontSize: 18, fontWeight: '800', color: Colors.text, lineHeight: 22 },
    typePill:          { alignSelf: 'flex-start', backgroundColor: Colors.surface, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    typePillText:      { fontSize: 11, color: Colors.primary, fontWeight: '700' },
    redBadge:          { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.error, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
    redBadgeText:      { fontSize: 10, color: '#fff', fontWeight: '700' },
    closeBtn:          { padding: 4 },

    expiryBanner:      { flexDirection: 'row', alignItems: 'center', gap: 7, padding: 10, borderRadius: 12, borderWidth: 1 },
    expiryBannerDanger:{ backgroundColor: '#fff0f0', borderColor: Colors.error },
    expiryBannerWarn:  { backgroundColor: '#fffbeb', borderColor: Colors.warning },
    expiryBannerOk:    { backgroundColor: '#f0fdf4', borderColor: Colors.success },
    expiryBannerText:  { fontSize: 13, fontWeight: '600' },

    section:           { gap: 5 },
    sectionLabel:      { fontSize: 12, color: Colors.muted, fontWeight: '600', flexDirection: 'row', alignItems: 'center', gap: 4 },
    fieldValue:        { fontSize: 15, color: Colors.text, fontWeight: '500' },

    ingredientWrap:    { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
    ingBadge:          { backgroundColor: Colors.surface, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10 },
    ingText:           { fontSize: 11, color: Colors.text },

    input:             { borderWidth: 1, borderColor: Colors.borderDark, borderRadius: 10, padding: 11, fontSize: 14, color: Colors.text },
    inputMultiline:    { minHeight: 72, textAlignVertical: 'top' },

    analysisBanner:    { backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 5 },
    analysisDetails:   { backgroundColor: Colors.surface, borderRadius: 16, padding: 14, gap: 10, borderWidth: 1, borderColor: Colors.border },
    analysisHeading:   { fontSize: 15, fontWeight: '800', color: Colors.primary },
    scoreRow:          { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
    analysisField:     { gap: 3 },
    analysisFieldLabel:{ fontSize: 11, fontWeight: '800', color: Colors.textSecondary },
    analysisFieldValue:{ fontSize: 13, lineHeight: 18, color: Colors.text },
    analysisDanger:    { color: Colors.error },
    analysisScore:     { fontSize: 13, fontWeight: '700', color: Colors.primary },
    analysisVerdict:   { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },

    actions:           { flexDirection: 'row', gap: 10, marginTop: 6 },
    editBtn:           { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, padding: 13, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.primary },
    editBtnText:       { fontSize: 14, fontWeight: '700', color: Colors.primary },
    actionMoreBtn:     { padding: 13, borderRadius: 14, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
    actionMoreText:    { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
    hiddenAction:      { display: 'none' },
    cancelBtn:         { flex: 1, padding: 13, borderRadius: 14, backgroundColor: Colors.surface, alignItems: 'center' },
    cancelBtnText:     { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
    saveBtn:           { flex: 1, padding: 13, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center' },
    saveBtnText:       { fontSize: 14, fontWeight: '700', color: '#fff' },
});

