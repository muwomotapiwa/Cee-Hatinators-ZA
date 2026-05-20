const SHOP_CATEGORY_BY_TILE: Record<string, string> = {
  'Boater': 'Church Hats',
  'Breton': 'Church Hats',
  'Cartwheel / Picture Hat': 'Church Hats',
  'Cloche': 'Church Hats',
  'Fedora': 'Church Hats',
  'Trilby': 'Church Hats',
  'Bowler / Derby': 'Church Hats',
  'Pork Pie': 'Church Hats',
  'Capeline': 'Church Hats',
  'Sailor Hat': 'Church Hats',
  'Padre / Cappello Romano': 'Church Hats',
  'Pillbox': 'Fascinators',
  'Beret': 'Fascinators',
  'Turban': 'Hatinators',
  'Calotte / Skull Cap': 'Bonnets',
  'Fez / Tarboosh': 'Church Hats',
  'Toque': 'Church Hats',
  'Hood / Cone': 'Bonnets',
  'Fascinator': 'Fascinators',
  'Percher': 'Fascinators',
  'Cocktail Hat': 'Fascinators',
  'Halo Hat / Crown': 'Hatinators',
  'Button / Disc': 'Fascinators',
  'Teardrop': 'Fascinators',
  'Juliet Cap': 'Fascinators',
  'Visor': 'Accessories',
  'Newsboy / Gatsby': 'Church Hats',
  'Ascot / Flat Cap': 'Church Hats',
  'Bonnet': 'Bonnets',
  'Bucket Hat': 'Accessories',
};

export function getShopPathForCategoryTile(categoryName: string) {
  const shopCategory = SHOP_CATEGORY_BY_TILE[categoryName] || 'Hatinators';
  return `/shop?category=${encodeURIComponent(shopCategory)}`;
}
