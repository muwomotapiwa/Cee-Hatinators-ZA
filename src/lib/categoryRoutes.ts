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
  'Calotte / Skull Cap': 'Veilings',
  'Fez / Tarboosh': 'Church Hats',
  'Toque': 'Church Hats',
  'Hood / Cone': 'Veilings',
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
  'Bonnet': 'Veilings',
  'Bucket Hat': 'Accessories',
};

export function getShopCategoryForCategoryTile(categoryName: string) {
  return SHOP_CATEGORY_BY_TILE[categoryName] || 'Hatinators';
}

export function getShopPathForCategoryTile(categoryName: string) {
  const shopCategory = getShopCategoryForCategoryTile(categoryName);
  return `/shop?category=${encodeURIComponent(shopCategory)}`;
}
