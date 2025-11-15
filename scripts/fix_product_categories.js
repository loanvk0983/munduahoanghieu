const products = require('../cms/models/products');

function fix() {
  const mapping = {
    1: 'processed',
    2: 'chips',
    3: 'raw',
    4: 'custom'
  };

  Object.entries(mapping).forEach(([id, cat]) => {
    const pid = Number(id);
    const p = products.getProductById(pid);
    if (!p) {
      console.log(`Product ${pid} not found`);
      return;
    }
    console.log(`Before: id=${pid} slug=${p.slug} category=${p.category}`);
    products.updateProduct(pid, {
      slug: p.slug,
      name: p.name,
      description: p.description,
      category: cat,
      price: p.price,
      image: p.image,
      is_featured: p.is_featured,
      display_order: p.display_order,
      features: p.features || []
    });
    const after = products.getProductById(pid);
    console.log(`After: id=${pid} slug=${after.slug} category=${after.category}`);
  });
}

fix();
