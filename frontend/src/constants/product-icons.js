export const PRODUCT_ICONS = [
  { id: 'serum', label: 'Serum', image: require('../icons/serum.png') },
  { id: 'chai_to', label: 'Chai to', image: require('../icons/chaito.png') },
  { id: 'hu', label: 'Hũ kem', image: require('../icons/hu.png') },
  { id: 'tuyp_xanh', label: 'Tuýp xanh', image: require('../icons/tuypxanh.png') },
  { id: 'oil', label: 'Dầu dưỡng', image: require('../icons/oil.png') },
  { id: 'pum', label: 'Vòi nhấn', image: require('../icons/pum.png') },
  { id: 'mask', label: 'Mặt nạ', image: require('../icons/mask.png') },
  { id: 'tuyp', label: 'Tuýp', image: require('../icons/tuyp.png') },
  { id: 'xit', label: 'Xịt khoáng', image: require('../icons/xit.png') },
];

export const PRODUCT_TYPES = [
  { id: 'cleanser', label: 'Cleanser' },
  { id: 'toner', label: 'Toners' },
  { id: 'essences', label: 'Essences' },
  { id: 'cream', label: 'Cream' },
  { id: 'oil', label: 'Oil' },
  { id: 'serum', label: 'Serums' },
  { id: 'treatment', label: 'Treatments' },
  { id: 'moisturizer', label: 'Moisturizers' },
  { id: 'sunscreen', label: 'Sunscreens' },
  { id: 'mask', label: 'Masks' },
  { id: 'exfoliant', label: 'Exfoliants' },
  { id: 'others', label: 'Others' },
];

const DEFAULT_ICON_FOR_TYPE = {
  cleanser: 'tuyp',
  toner: 'chai_to',
  essences: 'serum',
  cream: 'hu',
  oil: 'oil',
  serum: 'serum',
  treatment: 'tuyp_xanh',
  moisturizer: 'hu',
  sunscreen: 'tuyp_xanh',
  mask: 'mask',
  exfoliant: 'chai_to',
  others: 'pum',
  other: 'pum',
};

export const getProductIcon = (iconId, productType) => (
  PRODUCT_ICONS.find(icon => icon.id === iconId)
  || PRODUCT_ICONS.find(icon => icon.id === DEFAULT_ICON_FOR_TYPE[productType])
  || PRODUCT_ICONS[0]
);

export const getDefaultIconForType = productType => DEFAULT_ICON_FOR_TYPE[productType] || 'serum';
